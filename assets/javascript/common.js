var website = website || {},
    $html = $('html');

(function (publics) {
    "use strict";

    var privates = {},
        socket = io.connect();

    publics.isEditable = false;

    publics.cleanDataEdit = function ($object) {
        $object.removeAttr("data-edit-targeted");
        $object.find('[data-edit-targeted=true]').removeAttr("data-edit-targeted");
        return $object;
    }

    publics.targetDataEdit = function () {
        function clone(obj) {
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        }

        $("[data-edit=true]").each(function (i) {
            var $currentDataEdit = $(this),
                $popup = $(".popup");

            $currentDataEdit.attr('data-edit-targeted', true);

            $currentDataEdit.click(function (e) {
                var $editedObject = $(this),
                    options = {},
                    $template,
                    $clone,
                    content,
                    name,
                    accept = false;

                if (publics.isEditable) {
                    e.preventDefault();

                    $popup.addClass("opened");

                    if ($editedObject.data("edit-type") === "html" &&
                        $popup.find("." + $editedObject.data('edit-path').replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]")).length === 0) 
                    {
                        $template = $(".popup .template.html");
                        $clone = $template.clone().removeClass("template");
                        $clone = publics.cleanDataEdit($clone);
                        $popup.find(".insert").before($clone);
                        $clone.find("label").addClass($editedObject.data('edit-path'));
                        $clone.find("label .info").text($editedObject.data('edit-file') + " > " + $editedObject.data('edit-path'));
                        if ($editedObject.data('edit-source')) {
                            $clone.find("textarea").hide();
                            socket.emit('source-variation', {
                                path: $editedObject.data('edit-path'),
                                file: $editedObject.data('edit-file')
                            });
                        } else {
                            $clone.find("textarea").val($editedObject.html().trim());
                        }
                        if (!$editedObject.data('edit-source') || typeof $editedObject.data('edit-source') === 'string') {
                            $clone.find("textarea").keyup(function () {
                                $('[data-edit-path='+ $editedObject.data('edit-path').replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]") + ']').html($clone.find("textarea").val());
                                if (typeof $editedObject.data('edit-source') === 'string') {
                                    eval($editedObject.data('edit-source'));
                                }
                            });
                        }
                        privates.editedObjects.push($editedObject);
                        publics.targetDataEdit();
                    }

                    if ($editedObject.data("edit-type") === "text" &&
                        $popup.find("." + $editedObject.data('edit-path').replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]")).length === 0) 
                    {
                        $template = $(".popup .template.text");
                        $clone = $template.clone().removeClass("template");
                        $clone = publics.cleanDataEdit($clone);
                        $popup.find(".insert").before($clone);
                        $clone.find("label").addClass($editedObject.data('edit-path'));
                        $clone.find("label .info").text($editedObject.data('edit-file') + " > " + $editedObject.data('edit-path'));
                        if ($editedObject.data('edit-source')) {
                            $clone.find("input").hide();
                            socket.emit('source-variation', {
                                path: $editedObject.data('edit-path'),
                                file: $editedObject.data('edit-file')
                            });
                        } else {
                            $clone.find("input").val($editedObject.html().trim());
                        }
                        if (!$editedObject.data('edit-source') || typeof $editedObject.data('edit-source') === 'string') {
                            $clone.find("input").keyup(function () {
                                $('[data-edit-path='+ $editedObject.data('edit-path').replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]") + ']').html($clone.find("input").val());
                                if (typeof $editedObject.data('edit-source') === 'string') {
                                    eval($editedObject.data('edit-source'));
                                }
                            });
                        }
                        privates.editedObjects.push($editedObject);
                        publics.targetDataEdit();
                    }

                    if ($editedObject.data("edit-attr") === true) {
                        for (var i in $editedObject.data()) {
                            (function () {
                                var name;
                                if (i.indexOf('editAttrName') !== -1) {
                                    name = i.replace('editAttrName', '').toLowerCase();

                                    if ($popup.find("." + $editedObject.data('edit-attr-path-' + name).replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]")).length === 0) {
                                        accept = true;
                                        $template = $(".popup .template.text");
                                        $clone = $template.clone().removeClass("template");
                                        $clone = publics.cleanDataEdit($clone);
                                        $popup.find(".insert").before($clone);
                                        $clone.find("label").addClass($editedObject.data('edit-attr-path-' + name));
                                        $clone.find("label .info").text($editedObject.data('edit-attr-file-' + name) + " > " + $editedObject.data('edit-attr-path-' + name));
                                        if ($editedObject.data('edit-attr-source-' + name)) {
                                            $clone.find("input").hide();
                                            socket.emit('source-variation', {
                                                path: $editedObject.data('edit-attr-path-' + name),
                                                file: $editedObject.data('edit-attr-file-' + name)
                                            });
                                        } else {
                                            $clone.find("input").val($editedObject.attr(name).trim());
                                        }
                                        if (!$editedObject.data('edit-attr-source-' + name) || typeof $editedObject.data('edit-attr-source-' + name) === 'string') {
                                            $clone.find("input").keyup(function () {
                                                var currentName = currentName || clone(name);
                                                $('[data-edit-attr-path-' + currentName + '='+ $editedObject.data('edit-attr-path-' + currentName).replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]") + ']').attr(currentName, $(this).val());
                                                if (typeof $editedObject.data('edit-attr-source-' + name) === 'string') {
                                                    eval($editedObject.data('edit-attr-source-' + name));
                                                }
                                            });
                                        }
                                    }
                                }
                            }())
                        }
                        if (accept) {
                            publics.targetDataEdit();
                            privates.editedObjects.push($editedObject);
                        }
                    }
                }
            });
        });
    };

    publics.editContent = function () {
        var ctrlIsPressed = false,
            $popup = $(".popup");

        privates.editedObjects = [];

        // Ctrl is currently press ?
        $(document).keyup(function(e) {
            if (!e.ctrlKey) {
                ctrlIsPressed = e.ctrlKey;
                publics.isEditable = false;
                $html.removeClass("is-editable");
            }
        }).keydown(function(e) {
            if (e.ctrlKey) {
                ctrlIsPressed = e.ctrlKey;
                publics.isEditable = true;
                $html.addClass("is-editable");
            }
        });

        $(".popup .update-variation-change").click(function () {
            var options = [],
                currentOptions,
                name;
                
            if (!website.isEditable) {

                for (var i = 0, l = privates.editedObjects.length; i < l; i++) {
                    if (privates.editedObjects[i].data('edit-type') === 'html') {
                        currentOptions = {};

                        currentOptions.file = privates.editedObjects[i].data("edit-file");
                        currentOptions.path = privates.editedObjects[i].data("edit-path");
                        currentOptions.source = privates.editedObjects[i].data("edit-source");
                        currentOptions.type = 'html';
                        currentOptions.value = $(".popup ." + privates.editedObjects[i].data("edit-path").replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]")).next().val().trim();
                        options.push(currentOptions);
                    }

                    if (privates.editedObjects[i].data('edit-type') === 'text') {
                        currentOptions = {};

                        currentOptions.file = privates.editedObjects[i].data("edit-file");
                        currentOptions.path = privates.editedObjects[i].data("edit-path");
                        currentOptions.source = privates.editedObjects[i].data("edit-source");
                        currentOptions.type = 'text';
                        currentOptions.value = $(".popup ." + privates.editedObjects[i].data("edit-path").replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]")).next().val().trim();
                        options.push(currentOptions);
                    }

                    if (privates.editedObjects[i].data('edit-attr') === true) {
                        for (var j in privates.editedObjects[i].data()) {
                            if (j.indexOf('editAttrName') !== -1) {
                                name = j.replace('editAttrName', '').toLowerCase();

                                currentOptions = {};

                                currentOptions.file = privates.editedObjects[i].data("edit-attr-file-" + name);
                                currentOptions.path = privates.editedObjects[i].data("edit-attr-path-" + name);
                                currentOptions.type = 'attr';
                                currentOptions.source = privates.editedObjects[i].data("edit-attr-source-" + name);
                                currentOptions.attrName = name;
                                currentOptions.value = $(".popup ." + privates.editedObjects[i].data("edit-attr-path-" + name).replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]")).next().val().trim();
                                options.push(currentOptions);
                            }
                        }
                    }
                }

                publics.sendContent(options);

                privates.editedObjects = [];
                $(".popup .html:not(.template)").remove();
                $(".popup .text:not(.template)").remove();

                $popup.removeClass("opened");
            }
        });

        $(".popup .next-variation-change").click(function () {
            $popup.removeClass("opened");
        });

        publics.targetDataEdit();
    };

    publics.sendContent = function (options) {
        socket.emit('update-variation', options);
    };

    publics.sourceContent = function (options) {
        socket.on('source-variation', function (data) {
            var area = $(".popup ." + data.path.replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]")).next();
            area.show();
            area.val(data.value);
            area.next().show();
        });
    };

    publics.broadcastContent = function (options) {
        socket.on('update-variation', function (data) {
            if (data.type === 'html') {
                $('[data-edit-path=' + data.path.replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]") + ']').html(data.value);
                eval(data.source);
            } 
            if (data.type === 'text') {
                $('[data-edit-path=' + data.path.replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]") + ']').html(data.value);
                eval(data.source);
            }
            if (data.type === 'attr') {
                $('[data-edit-attr-path-' + data.attrName + '=' + data.path.replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]") + ']').attr(data.attrName, data.value);
                eval(data.source);
            }
        });
    };

    publics.addText = function () {
        $(".add-text > span, .add-text > div").each(function () {
            if ($(this).html().indexOf(" [Partie ajoutée côté client]") === -1) {
                $(this).html( $(this).html() + " [Partie ajoutée côté client]" );             
            }
        });
    }
    publics.addAttr = function () {
        $(".add-attr").each(function () {
            if ($(this).attr('href').indexOf(" [Partie ajoutée côté client]") === -1) {
                $(this).attr('href', $(this).attr('href') + " [Partie ajoutée côté client]" );
            }
            if ($(this).attr('title').indexOf(" [Partie ajoutée côté client]") === -1) {
                $(this).attr('title', $(this).attr('title') + " [Partie ajoutée côté client]" );
             }
        });
    }


    publics.init = function () {
        publics.editContent();
        publics.broadcastContent();
        publics.sourceContent();

        website.addText();
        website.addAttr();
    };
}(website));

website.init();