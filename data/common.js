// common functions
"use strict";

function createNode(type, obj, data, style) {
    var node = document.createElement(type);
    if (obj)
        for (var opt in obj)
            if (obj.hasOwnProperty(opt))
                node[opt] = obj[opt];
    if (data)
        for (var el in data)
            if (data.hasOwnProperty(el))
                node.dataset[el] = data[el];
    if (style)
        for (var st in style)
            if (style.hasOwnProperty(st))
                node.style[st] = style[st];
    return node;
}