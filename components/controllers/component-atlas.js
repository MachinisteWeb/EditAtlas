/* jslint node: true */
var website = {};

(function (publics) {
    "use strict";

    publics.changeSection = function (dom, replacement) {
        dom = dom
            .replace(/<(div|nav|aside|article|section)\$/g, "<" + replacement)
            .replace(/<\/(div|nav|aside|article|section)\$>/g, "</" + replacement + ">");

        return dom;
    };

    publics.changeHeaders = function (dom) {
        dom = dom
            .replace(/<(header|footer|h1|h2|h3|h4|h5|h6)\$/g, '<div class="$1-like"')
            .replace(/<div class=(")(header|footer|h1|h2|h3|h4|h5|h6)-like(")(.+)(class=)('|")(.+)('|")/g, '<div class=$8$2-like $7$8')
            .replace(/<\/(header|footer|h1|h2|h3|h4|h5|h6)\$>/g, "</div>");

        return dom;
    };

    publics.ignoreHeaders = function (dom) {
        dom = dom
            .replace(/<(header|footer|h1|h2|h3|h4|h5|h6)\$/g, '<$1')
            .replace(/<\/(header|footer|h1|h2|h3|h4|h5|h6)\$>/g, "</$1>");

        return dom;
    };

    publics.includeComponents = function (variation, NA, componentVariation, activateSemantic) {
        var ejs = NA.modules.ejs;

        variation.ic = variation.includeComponents = function (placeholder, component, path) {
            var render = "",
                currentComponents = variation.specific[componentVariation],
                currentVariation,
                currentPath,
                dom = "";

            if (!componentVariation) {
                componentVariation = "components";
            }

            if (component) {
                currentComponents = component[componentVariation];
                if (typeof component === 'string') {
                    currentComponents = variation[component][componentVariation];
                } else {
                    currentComponents = component[componentVariation];
                }
            }

            if (typeof currentComponents !== 'undefined' && typeof currentComponents[placeholder] !== 'undefined' && currentComponents[placeholder].length > 0) {
                for (var i = 0; i < currentComponents[placeholder].length; i++) {

                    currentVariation = 'specific["' + componentVariation + '"]["' + placeholder + '"][' + i + '].variation';
                    currentPath = ((path) ? path : "") + componentVariation + "." + placeholder + "[" + i + "].variation.";

                    if (component) {
                        if (typeof component === 'string') {
                            currentVariation = component + '["' + componentVariation + '"]["' + placeholder + '"][' + i + '].variation';
                        } else {
                            currentVariation = JSON.stringify(currentComponents[placeholder][i].variation);
                        }
                    }

                    dom = ejs.render(
                        '<%- include("' + currentComponents[placeholder][i].path + '", { component: ' + currentVariation + ', path : "' + currentPath + '" }) %>',
                        variation
                    );

                    if (typeof activateSemantic === 'string' && currentComponents[placeholder][i].variation && currentComponents[placeholder][i].variation[activateSemantic]) {                        
                        if (currentComponents[placeholder][i].variation[activateSemantic] === "div" || 
                           currentComponents[placeholder][i].variation[activateSemantic] === "header"  || 
                           currentComponents[placeholder][i].variation[activateSemantic] === "footer") 
                        {
                            dom = publics.changeHeaders(dom);
                        } else {
                            dom = publics.ignoreHeaders(dom);
                        }

                        dom = publics.changeSection(dom, currentComponents[placeholder][i].variation[activateSemantic]);

                    } else {
                        dom = publics.changeSection(dom, "section");
                        dom = publics.ignoreHeaders(dom);
                    }

                    render = render + dom;
                }
            }

            return render;
        };

        variation.component = {};

        return variation;
    };

}(website));

exports.includeComponents = website.includeComponents;