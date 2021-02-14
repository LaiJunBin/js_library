Component.create({
    selector: 'app-root',
    template: 'template.html'
})(class {
    constructor() {
        this.count = 0;
    }

    counting() {
        this.count++;
    }
});