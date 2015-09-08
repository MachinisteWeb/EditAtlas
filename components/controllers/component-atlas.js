/* jslint node: true */
var website = {};

(function (publics) {

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

    publics.changeSemantic = function (currentComponents, placeholder, i, activateSemantic, dom) {
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

        return dom;
    };

    publics.ignoreHeaders = function (dom) {
        dom = dom
            .replace(/<(header|footer|h1|h2|h3|h4|h5|h6)\$/g, '<$1')
            .replace(/<\/(header|footer|h1|h2|h3|h4|h5|h6)\$>/g, "</$1>");

        return dom;
    };

    publics.setCurrentComponents = function (component, componentVariation, currentComponents, variation) {
        if (component) {
            currentComponents = component[componentVariation];
            if (typeof component === 'string') {
                currentComponents = variation[component][componentVariation];
            }
        }

        return currentComponents;
    };

    publics.placeholderNoEmpty = function (currentComponents, placeholder, callback) {
        if (typeof currentComponents !== 'undefined' &&
            typeof currentComponents[placeholder] !== 'undefined'
            && currentComponents[placeholder].length > 0)
        {
            callback();
        }
    };

    publics.includeComponents = function (variation, componentVariation, activateSemantic) {
        var NA = this,
            ejs = NA.modules.ejs;

        variation.ic = variation.includeComponents = function (placeholder, component, path) {
            var render = "",
                currentComponents = variation.specific[componentVariation],
                currentVariation,
                currentPath,
                dom = "";

            if (!componentVariation) {
                componentVariation = "components";
            }

            currentComponents = publics.setCurrentComponents(component, componentVariation, currentComponents, variation);

            publics.placeholderNoEmpty(currentComponents, placeholder, function () {
                for (var i = 0; i < currentComponents[placeholder].length; i++) {

                    currentVariation = 'specific["' + componentVariation + '"]["' + placeholder + '"][' + i + '].variation';
                    currentPath = ((path) ? path : "") + componentVariation + "." + placeholder + "[" + i + "].variation.";

                    if (component && typeof component === 'string') {
                        currentVariation = component + '["' + componentVariation + '"]["' + placeholder + '"][' + i + '].variation';
                    } else if (component && typeof component !== 'string') {
                        currentVariation = JSON.stringify(currentComponents[placeholder][i].variation);
                    }

                    dom = ejs.render(
                        '<%- include("' + currentComponents[placeholder][i].path + '", { component: ' + currentVariation + ', path : "' + currentPath + '" }) %>',
                        variation
                    );

                    dom = publics.changeSemantic(currentComponents, placeholder, i, activateSemantic, dom);

                    render = render + dom;
                }
            });

            return render;
        };

        variation.component = {};

        return variation;
    };

}(website));

exports.includeComponents = website.includeComponents;