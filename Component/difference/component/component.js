window.Component = (function(){
    class Component {
        static basepath = './';
        static styles = [];
        static #stylesDOM = {};
        static #instances = [];

        constructor() {
            this.selector = null;
            this.template = null;
            this.styles = [];
            this.path = './';
        }

        static select(selector) {
            let components = Component.#instances.filter(component => component.selector === selector);
            return components.map(component => (({ $el, $data }) => ({ $el, $data }))(component));
        }

        static create(params) {
            let component = new Component();
            component.$data = {};
            component.$instance = {$init: ()=>({})};

            for (let key in params) {
                if (component[key] === undefined)
                    throw new Error(`Component create error! unknow key: ${key}`)

                component[key] = params[key];
            }

            let nullField = Object.keys(component).find(x => component[x] === null);
            if (nullField !== undefined)
                throw new Error(`Create component key: "${nullField}" can't be null.`);

            return service => {
                if (service) {
                    return component.service = new (class Observable extends service {
                        constructor(component) {
                            super();
                            component.$instance.$init = function(){
                                return new service;
                            }
                            component.building();
                        }
                    })(component);
                } else {
                    component.building();
                }
            }
        }

        building() {
            let component = this;
            if (customElements.get(component.selector) === undefined)
                customElements.define(component.selector, class extends HTMLElement {
                    constructor() {
                        super();
                    }

                    async connectedCallback() {
                        let $instance = {
                            selector: component.selector,
                        };
                        const shadow = this.attachShadow({
                            mode: 'open'
                        });
                        let instance = component.$instance.$init();
                        component.$el = this;
                        $instance.$el = this;
                        for (let key of this.getAttributeNames()) {
                            let value = this.getAttribute(key);
                            instance[key] = value;
                            this.removeAttribute(key);
                        }
                        instance = new class Observable {
                            constructor(component, object) {
                                for (let property in object) {
                                    this[property] = object[property];
                                    Object.defineProperty(this, property, {
                                        get() {
                                            return object[property];
                                        },

                                        set(value) {
                                            object[property] = value;
                                            component.rebuilding.call($instance, this);
                                        }
                                    });
                                }
                            }
                        }(component, instance);

                        let parserComponent = () => {
                            let parserRegExp = new RegExp('\{\{([^}]+)\}\}', 'g');
                            if (component.service) {
                                Object.setPrototypeOf(instance, component.service);
                            }
                            Object.setPrototypeOf(component.$data, instance);
                            $instance.$data = instance;

                            let dfs = function (node) {
                                if (node.getAttributeNames) {
                                    for (let key of node.getAttributeNames()) {
                                        let value = node.getAttribute(key);
                                        let nodeHTML = node.outerHTML;

                                        // event
                                        if (key.startsWith('(') && key.endsWith(')')) {
                                            let event = key.substring(1, key.length - 1);
                                            let functionName = value.split('(')[0];
                                            let params = value.substring(value.indexOf('(') + 1, value.length - 1).split(',').map(x => x.trim()).filter(x => x != "");
                                            params = params.map(param => instance[param] || param);

                                            node.addEventListener(event, function (e) {
                                                let func = instance[functionName];
                                                if (func === undefined)
                                                    throw new Error(`${nodeHTML} ${functionName} is undefined.`)

                                                if (func.length === params.length) {
                                                    instance[functionName].apply(instance, params);
                                                } else if (func.length > params.length) {
                                                    instance[functionName].apply(instance, [e, ...params]);
                                                } else {
                                                    throw new Error(`${nodeHTML} Event: ${event} ${value} params length error!`);
                                                }
                                            })

                                            node.removeAttribute(key);
                                        }

                                        if (key.startsWith('[') && key.endsWith(']')) {
                                            let attr = key.substring(1, key.length - 1);
                                            if (instance[value] === undefined)
                                                throw new Error(`${nodeHTML} ${key}=${value}, ${value} is undefined.`);

                                            node[attr] = instance[value];
                                            node.removeAttribute(key);
                                        }

                                        if (key === '[(model)]') {
                                            node.addEventListener('input', function (e) {
                                                instance[value] = e.target.value;
                                            });
                                            node.value = instance[value];
                                        }

                                    }
                                }

                                // parser {{  }}
                                let textNodes = Array.from(node.childNodes).filter(x => x.nodeType == Node.TEXT_NODE);
                                for (let textNode of textNodes) {
                                    let matches = Array.from(textNode.textContent.matchAll(parserRegExp));
                                    for (let i = 0; i < matches.length; i++) {
                                        if (instance[matches[i][1].trim()] !== undefined) {
                                            textNode.textContent = textNode.textContent.replace(matches[i][0], instance[matches[i][1].trim()]);
                                        }
                                    }
                                }

                                for (let child of node.children) {
                                    dfs(child);
                                }
                            }

                            dfs(shadow);
                        };

                        await fetch(cleanURL(`${Component.basepath}/${component.path}/${component.template}`))
                            .then(res => res.text())
                            .then(res => shadow.innerHTML = res)
                            .then(async () => {
                                // Load global styles
                                for (let styleUrl of Component.styles) {
                                    if (!Component.#stylesDOM[styleUrl]) {
                                        let style = document.createElement('style');
                                        let styleText = await fetch(cleanURL(`${styleUrl}`)).then(res => res.text());
                                        style.append(styleText);
                                        Component.#stylesDOM[styleUrl] = style;
                                    }
                                    shadow.appendChild(Component.#stylesDOM[styleUrl].cloneNode(true));
                                }

                                // Load component styles
                                for (let styleUrl of component.styles) {
                                    let style = document.createElement('style');
                                    let styleText = await fetch(cleanURL(`${Component.basepath}/${component.path}/${styleUrl}`)).then(res => res.text());
                                    style.append(styleText);
                                    shadow.appendChild(style);
                                }
                            }).then(() => {
                                $instance.templateHTML = shadow.innerHTML;
                                parserComponent();
                                this.dispatchEvent(new Event('load'));
                                component.$instance = $instance;
                                Component.#instances.push($instance);
                            });
                    }
                });
        }

        rebuilding(instance) {
            const shadow = this.$el.shadowRoot;
            let div = document.createElement('div');
            let component = this;

            let parserComponent = () => {
                let parserRegExp = new RegExp('\{\{([^}]+)\}\}', 'g');

                let dfs = function (node, checkNode) {
                    if (node.getAttributeNames) {

                        for (let key of node.getAttributeNames()) {
                            let value = node.getAttribute(key);
                            let nodeHTML = node.outerHTML;
                            if (key.startsWith('[') && key.endsWith(']')) {
                                let attr = key.substring(1, key.length - 1);

                                if (instance[value] === undefined)
                                    throw new Error(`${nodeHTML} ${key}=${value}, ${value} is undefined.`);

                                checkNode[attr] = instance[value];
                            }
                        }
                    }

                    let textNodes = Array.from(node.childNodes).filter(x => x.nodeType == Node.TEXT_NODE);
                    for (let textNode of textNodes) {
                        let matches = Array.from(textNode.textContent.matchAll(parserRegExp));
                        for (let i = 0; i < matches.length; i++) {
                            if (instance[matches[i][1].trim()] !== undefined) {
                                textNode.textContent = textNode.textContent.replace(matches[i][0], instance[matches[i][1].trim()]);
                            }
                        }
                    }

                    if (checkNode.nodeType !== 11) {
                        if (node.nodeType === 3) {
                            if (node.textContent !== checkNode.textContent) {
                                checkNode.textContent = node.textContent;
                            }
                        } else {
                            for (let i = 0; i < checkNode.childNodes.length; i++) {
                                if (node.childNodes[i]?.nodeType === 3) {
                                    if (checkNode.childNodes[i].textContent !== node.childNodes[i].textContent) {
                                        checkNode.childNodes[i].textContent = node.childNodes[i].textContent;
                                    }
                                }
                            }
                        }
                    }

                    for (let i = 0; i < node.childNodes.length; i++) {
                        dfs(node.childNodes[i], checkNode.childNodes[i]);
                    }
                }

                dfs(div, shadow);
            };

            div.innerHTML = component.templateHTML;
            parserComponent();
        }
    }

    function cleanURL(url = '') {
        return url.split('/').filter(x => x).join('/');
    }

    return Component;
})();