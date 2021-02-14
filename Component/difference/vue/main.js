Promise.all([
        fetch('./components/static.html').then(res => res.text()),
        fetch('./components/root.html').then(res => res.text()),
        fetch('./components/style.html').then(res => res.text()),
        fetch('./components/test/index.html').then(res => res.text())
    ])
    .then(templates => {
        let app = new Vue({
            el: '#app',
            components: {
                'app-style': {
                    data: function () {
                        return {
                            styleText: 'color:red'
                        }
                    },
                    template: templates[2],
                },
                'app-static': {
                    template: templates[0]
                },
                'app-root': {
                    data: function () {
                        return {
                            count: 0,
                        }
                    },
                    methods: {
                        add() {
                            this.count++;
                        }
                    },
                    components: {
                        'app-test': {
                            data: function () {
                                return {
                                    data: ''
                                }
                            },
                            methods: {
                                show() {
                                    console.log(`Your input = ${this.data}`);
                                }
                            },
                            template: templates[3]
                        },
                    },
                    template: templates[1]
                },
            }
        });
    });