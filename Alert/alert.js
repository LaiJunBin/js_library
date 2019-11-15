class Alert {

    constructor(options = {}) {
        let ele = document.createElement('div');
        ele.style.width = '100vw';
        ele.style.height = '100vh';
        ele.style.background = '#ddd3';
        ele.style.position = 'fixed';
        ele.style.left = 0;
        ele.style.top = 0;
        ele.style.display = 'flex';
        ele.style.alignItems = 'center';
        ele.style.justifyContent = 'center';

        let alert = document.createElement('div');
        alert.style.transform = 'scale(0)';
        alert.style.transition = 'transform .35s';
        alert.style.background = '#fff';
        alert.style.border = '1px solid #333';
        alert.style.borderRadius = '7px';
        alert.style.minWidth = '250px';
        alert.style.minHeight = '100px';
        alert.style.fontSize = '20px';
        alert.style.textAlign = 'center';
        alert.style.position = 'fixed';

        let header = document.createElement('div');
        header.style.background = '#39f6';
        header.style.padding = '10px';
        header.style.marginBottom = '5px';
        header.style.cursor = 'grab';
        header.innerText = options.headerText || 'Message';

        let msg = document.createElement('div');
        msg.append(options.messageBody);
        msg.style.textAlign = options.textAlign || 'left';
        msg.style.padding = '0 10px';

        let button = document.createElement('button');
        button.innerText = options.buttonText || 'OK';
        button.style.padding = '3px 7px';
        button.style.background = '#ebbb72';
        button.style.border = '0';
        button.style.borderRadius = '5px';
        button.style.minWidth = '50px';
        button.style.height = '30px';
        button.style.margin = '8px';
        button.style.cursor = 'pointer';

        button.addEventListener('mouseover', function () {
            this.style.background = '#ebbb7277';
        });

        button.addEventListener('mouseleave', function () {
            this.style.background = '#ebbb72';
        });

        var globalEnterEvent = function (e) {
            if (e.keyCode == 13) {
                button.click();
            }
        }

        button.addEventListener('click', () => {
            document.removeEventListener('keydown', globalEnterEvent);
            alert.style.transform = 'scale(0)';
            setTimeout(() => {
                ele.remove();
                options.resolve();
            }, 350);
        });

        document.addEventListener('keydown', globalEnterEvent)

        header.addEventListener('mousedown', function (e) {
            header.style.cursor = 'grabbing';
            var {
                offsetX,
                offsetY
            } = e;
            var mousemoveEvent = function (e) {
                let {
                    clientX,
                    clientY
                } = e;
                alert.style.left = `${clientX - offsetX}px`;
                alert.style.top = `${clientY - offsetY}px`;
            }
            document.addEventListener('mousemove', mousemoveEvent);
            document.addEventListener('mouseup', function () {
                header.style.cursor = 'grab';
                document.removeEventListener('mousemove', mousemoveEvent);
            });
        });

        alert.appendChild(header);
        alert.appendChild(msg);
        alert.appendChild(button);
        ele.append(alert);
        document.body.appendChild(ele);

        setTimeout(() => {
            alert.style.transform = 'scale(1)';
        }, 25);

        if (options.callback !== undefined)
            options.callback();
    }

    static async showMessage(message, options = {}) {
        return new Promise(resolve => {
            return new Alert({
                ...options,
                messageBody: message,
                resolve
            });
        });
    }

    static async prompt(message, defaultValue = 4, options = {}) {
        var input = document.createElement('input');
        input.style.border = '1px solid #333';
        input.style.borderRadius = '3px';
        input.style.height = '26px';
        input.style.width = '80%';
        input.style.fontSize = '20px';
        input.style.marginTop = '3px';

        for (let option in options) {
            if (option in input.__proto__) {
                input[option] = options[option];
            }
        }

        return new Promise(resolve => {
            return new Alert({
                ...options,
                headerText: message,
                messageBody: input,
                textAlign: 'center',
                resolve,
                callback: function () {
                    input.focus();
                }
            });
        }).then(() => {
            return +input.value || defaultValue;
        });
    }

}
