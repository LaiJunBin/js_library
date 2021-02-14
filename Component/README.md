# Component

> Simple js component library.

## Basic usage

index.html
```html
<app-root></app-root>
<script src="./main.js"></script>
```

template.html
```html
<div>hello {{ count }}</div>
<button (click)="counting()">Counting!</button>
```

main.js
```js
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
```

[Basic DEMO](https://laijunbin.github.io/js_library/Component/basic/)


[DEMO](https://laijunbin.github.io/js_library/Component)