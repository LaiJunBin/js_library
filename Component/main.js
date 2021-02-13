Component.basepath = './components';
Component.styles = [
    './components/style.css'
];

Component.create({
    selector: 'app-static',
    template: 'static.html'
})();

Component.create({
    selector: 'app-root',
    template: 'root.html',
    styles: ['root.css']
})(class {
    constructor() {
        this.count = 0;
    }

    add() {
        this.count++;
    }
});

Component.create({
    selector: 'app-test',
    template: './test/index.html',
    // or
    // path: './test',
    // template: 'index.html'
})(class {
    constructor() {
        this.data = '';
    }

    show() {
        Alert.showMessage(`Your input = ${this.data}`);
    }
});

Component.create({
    selector: 'app-style',
    template: 'style.html'
})(class {
    constructor() {
        this.styleText = 'color: red;';
    }
})