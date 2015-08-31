# EdtitAtlas #

Version : 0.16 (Beta)

NodeAtlas Version minimale : 0.44

**For an international version of this README.md, [see below](#international-version).**



## Avant-propos ##

EditAtlas est un exemple d'édition de contenu sans Back-office avec [NodeAtlas](http://www.lesieur.name/nodeatlas/). Facile à intégrer, facile à éditer ! Il permet :

 1. L'édition de n'importe quel texte, groupe de balise HTML ou attribut de balise dans la source cliente. 

 2. L'édition avec rendu caractère par caractère du résultat final en temps réel partout où la phrase est logée dans la page.

 3. Répercution de toutes les modifications sur toutes les pages déjà ouvertes dans les navigateurs des utilisateurs sans rechargement de celles-ci.
 
 4. Modification du texte depuis la source serveur (désactive les features 2 et 3).
 
 5. Jouer des fonctions après modification pour re-rendre en temps réel le résultat (active la feature 4 et ré-active 2 et 3).

 6. D'empiler et de déplacer vos zones d'édition dans une fenêtre pour toujours voir votre rendu.

Vous pouvez télécharger ce repository en vu de le tester ou de l'intégrer à l'un de vos projets [NodeAtlas](http://www.lesieur.name/nodeatlas/) ou node.js. Ce mécanisme est actuellement utilisé sur [BookAtlas](https://github.com/Haeresis/BookAtlas/).

Un exemple live de ce repository est testable à [http://www.lesieur.name/edit-atlas/](http://www.lesieur.name/edit-atlas/). *La seule différence avec le code de ce repository est que l'enregistrement dans les fichiers de variation de l'exemple live a été inhibé pour qu'en rechargeant votre page, vous récupériez le contenu de test.*



## Comment ça marche ? ##

[NodeAtlas](http://www.lesieur.name/nodeatlas/) possède deux types de fichier de variation vous permettant pour un template donné d'injecter du contenu différent : 

- un fichier « common » à tous les templates et
- des fichiers « specific » par template. 

Cela est très pratique pour produire une même page de maquette HTML plusieurs fois ou pour créer des sites multilingues.


### Sans édition, en standard ###

Dans un contexte standard, avec une configuration comme celle-ci :

```js
{
	"controllersRelativePath": "controllers/",
	"commonController": "common.js",
	"commonVariation": "common.json",
	"routes": {
		"/": {
			"template": "index.htm",
			"variation": "index.json"
		}
	}
}
```

et en plaçant dans le fichier de variation `common.json` commun ces variables :

*common.json*

```js
{
	"text": "<p>Un texte dans common.</p>",
	"liens": [{
		"url": "./",
		"description": "Le titre du lien dans common.",
		"content": "Le contenu du lien dans common."
	}]
}
```

ainsi que dans un fichier spécifique `index.json` ces variables :

*index.json*

```js
{
	"texts": ["<p>Un texte dans specific.</p>"],
	"lien": {
		"url": "./",
		"description": "Le titre du lien dans specific.",
		"content": "Le contenu du lien dans specific."
	}
}
```

nous sommes capable de les afficher dans le template `index.htm` comme ceci :

```html
<%- common.text %>
<a href="<%= common.liens[0].url %>" title="<%= common.liens[0].description %>">
	<%- common.liens[0].content %>
</a>

<%- specific.texts[0] %>
<a href="<%= specific.lien.url %>" title="<%= specific.lien.description %>">
	<%- specific.lien.content %>
</a>
```

et le code source disponible dans votre navigateur pour l'adresse `http://localhost/` sera :

```html
<p>Un texte dans common.</p>
<a href="./" title="Le titre du lien dans common.">
	Le contenu du lien dans common.
</a>

<p>Un texte dans specific.</p>
<a href="./" title="Le titre du lien dans specific.">
	Le contenu du lien dans specific.
</a>
```



### Du contenu éditable à la volée ###

En transformant le code précédent en celui-ci :

```html
<%- eh(common, ['text','common.json']) %>
<a href="<%- ea(common, ['liens[0].url','common.json','href']) %>" title="<%- ea(common, ['liens[0].description','common.json','title']) %>">
	<%- et(common, ['liens[0].content','common.json']) %>
</a>

<%- eh(specific, ['texts[0]','index.json']) %>
<a href="<%- ea(specific, ['lien.url','index.json','href']) %>" title="<%- ea(specific, ['lien.title','index.json','title']) %>">
	<%- et(specific, ['lien.content','index.json']) %>
</a>
```

Vous obtiendrez alors la sortie suivante dans la source HTML :

```html
<div *attributs...*><p>Un texte dans common.</p></div>
<a *attributs...* href="./" title="Le titre du lien dans common.">
	<span *attributs...*>Le contenu du lien dans common.</span>
</a>

<div *attributs...*><p>Un texte dans specific.</p></div>
<a href="./" title="Le titre du lien dans specific.">
	<span *attributs...*>Le contenu du lien dans specific.</span>
</a>
```

On peut alors s'apercevoir que :

- La fonction `eh` (raccourci de `editHtml` qui fonctionne aussi) génère une `div` supplémentaire encadrant votre rendu. C'est une édition de type `block` pour éditer de large frange de HTML.
- Le fonction `et` (raccourci de `editText` qui fonctionne aussi) génère un `span` supplémentaire encadrant votre rendu. C'est une édition de type `inline` pour éditer des phrases, des titres, des menus, etc. tout élément ne contenant pas de balise de type `block`.
- Le fonction `ea` (raccourci de `editAttr` qui fonctionne aussi) génère des attributs supplémentaires dans la balise, mais ne créér pas de balise encadrante. Cela est réservé pour l'édition de lien, de titre, d'image ou même de classe, etc.

On remarque également que :

- Pour `editHtml`, `editText` et `editAttr`, on ne passe plus la variable mais l'objet contenant la variable. On passe en premier argument de fonction la valeur à afficher/modifier et en second le fichier json dans lequel la modification va être enregistré

**Dès lors, nos valeurs sont cliquables après avoir appuyé sur les touches `ctrl + s` et éditable dans la fenêtre d'édition. Maintenir `ctrl + s` permet d'en éditer plusieurs à la fois.**



### Gestion de droit d'édition / ne plus spécifier de fichier d'enregistrement ###

En imaginant que dans votre controlleur commun vous précisiez ceci :

```js
(function (publics) {
	"use strict";

	publics.changeVariation = function (params, mainCallback) {
		var variation = params.variation,
			session = params.request.session;

		// Création de variable à false.
		variation.fs = false;
		variation.fc = false;

		// Si l'utilisateur à le droit, on lui permet d'éditer les fichiers.
		if (session.hasPermissionForEdit) {
			// Le fichier spécifique utilisé pour générer cette vue.
			variation.fs = ((variation.languageCode) ? variation.languageCode + "/": "") + variation.currentRouteParameters.variation;
			// Le fichier commun utilisé pour générer cette vue.
			variation.fc = ((variation.languageCode) ? variation.languageCode + "/": "") + variation.webconfig.commonVariation;
		}

		mainCallback(variation);
	};
}(website));

exports.changeVariation = website.changeVariation;
```

vous pourriez permettre de controller dans quel condition un utilisateur peut ou ne peut pas éditer le texte. Une implémentation similaire tourne dans [BookAtlas](https://github.com/Haeresis/BookAtlas/).

Ainsi le code précédent pourrait s'écrire comme ci-après avec l'injection des variables `fs` et `fc` :

```html
<%- eh(common, ['text',fc]) %>
<a href="<%- ea(common, ['liens[0].url',fc,'href']) %>" title="<%- ea(common, ['liens[0].description',fc,'title']) %>">
	<%- et(common, ['liens[0].content',fc]) %>
</a>

<%- eh(specific, ['texts[0]',fs]) %>
<a href="<%- ea(specific, ['lien.url',fs,'href']) %>" title="<%- ea(specific, ['lien.title',fs,'title']) %>">
	<%- et(specific, ['lien.content',fs]) %>
</a>
```

Dans ce cas: 

- si l'utilisateur en a le droit, `fs` et `fc` fournissent les noms des fichiers, et l'édition est possible mais
- si l'utilisateur n'en a pas le droit, `fs` et `fc` valent `false` et l'édition n'est pas permise.

*Note : il est également nécéssaire dans la partie Back-end d'interdire l'enregistrement dans le fichier json au cas ou un utilisateur bidouillerais le code client.*



### Cas spécifique ###

Les balises tel que `<option>` ne peuvent pas contenir de balise enfant. Aussi il est impossible d'injecter une valeur comme ceci via `editText` (`et`) :

```html
<select 
	name="country">
	<option value=""><%- et(specific, ['fields.country.label', fs]) %></option>
	<% for (var i = 0; i < specific.fields.country.list.length; i++) { %>
		<option value="<% ... %>"><%- et(specific, ['fields.country.list[' + i + '].text', fs]) %></option>
	<% } %>
</select>
```

La solution est de remplacer le contenu et le chevron fermant de se type de balise par la fonction `editAttr` (`ea`) avec comme troisième paramètre la valeur `$text`. Afin de garder l'auto-coloration de votre éditeur intact, je vous conseil de fermer la balise comme dans l'exemple ci après.

```html
<select 
	name="country">
	<option value=""<%- ea(specific, ['fields.country.label', fs, '$text']) + "</option" %>>
	<% for (var i = 0; i < specific.fields.country.list.length; i++) { %>
		<option value="<%- ... %>"<%- ea(specific, ['fields.country.list[' + i + '].text', fs, '$text']) + "</option" %>>
	<% } %>
</select>
```



### Modification à partir de la source du serveur ###

Imaginons la valeur suivante dans le fichier de variations communes :

*common.json*

```js
{
	"titleArticle": "Cet article n'a pas de titre"
}
```

Cette valeur est interceptée côté controller comme ceci :

*common.js*

```js
(function (publics) {
	"use strict";

	publics.changeVariation = function (params, mainCallback) {
		var variation = params.variation,
			article;

		// Renvoi des informations sur un article à partir d'une valeur dans l'url.
		article = website.getArticle(/* Valeur dans l'url */);

		// Si l'article à un titre, alors on modifie la valeur de variation « titleArticle ».
		if (article.title) {
			variation.titleArticle = article.title;
		}

		mainCallback(variation);
	};
}(website));

exports.changeVariation = website.changeVariation;
```

Ci-bien que le rendu de ceci :

*index.htm*

```html
<%- et(common, ['articleTitle',fs]) %>
```

n'est pas ce qu'il y avait dans le fichier de variation :

```html
Cet article n'a pas de titre
```

mais le titre de l'article :

```html
Comment faire entendre raison à un sourd ?
```

Si je demande à éditer cette valeur, j'aurai dans mon champ d'édition la valeur de la source HTML « Comment faire entendre raison à un sourd ? » au lieu d'avoir la valeur « Cet article n'a pas de titre ». Par conséquent si j'enregistre, je viendrai écraser la valeur originale dans le fichier de variation par le titre de l'article... pas terrible.

Ce qu'il faut, ce n'est pas la source du fichier HTML mais la source du JSON. Pour la réclamer directement depuis le serveur, il faut ajouter un nouveau paramètre.

*index.htm*

```html
<%- et(common, ['articleTitle',fc,true]) %>
```

Ainsi la valeur éditer sera bien « Cet article n'a pas de titre ». Le revert de la médaille c'est que vous ne verrez pas vos modifications en direct, elles ne seront pas non plus répercuté sur les pages déjà ouvertes.

Vous pouvez faire de même avec les variables spécifiques bien entendu.

Vous pouvez également faire de même pour les modifications `editText`, `editHtml` et `editAttr` :

*index.htm*

```html
<%- et(common, ['articleTitle',fc,true]) %>
<%- eh(common, ['articleTitle',fc,true]) %>
<a href="<%- ea(common, ['articleTitle',fs,'href',true]) %>"></a>
```



### Exécution de fonctions en temps réel ###

Imaginons à présent que vous ayez la valeur suivante dans le fichier de variations communes :

*common.json*

```js
{
	"code": "<pre class=\"prettyprint linenums\"><code class=\"lang-html\">var test = 'Hello World';</code></pre>"
}
```

et que vous fassiez tomber cette valeur sur votre page de rendu :

*index.htm*

```html
<%- eh(common, ['code',fc]) %>
```

Ce qui affiche dans la source de votre page côté client :

```html
<pre class=\"prettyprint linenums\"><code class=\"lang-html\">var test = 'Hello World';</code></pre>
```

Cependant, une fois les fichiers JavaScript client exécuté, ce qu'il y a dans la source ne ressemble plus à cela mais à cela :

```html
<pre class="prettyprint linenums prettyprinted">
	<ol class="linenums">
		<li class="L0">
			<code class="lang-js">
				<span class="kwd">var</span>
				<span class="pln"> test </span>
				<span class="pun">=</span>
				<span class="pln"> </span>
				<span class="str">'Hello World'</span>
			</code>
		</li>
	</ol>
</pre>
```

car vous utilisez `prettify.js` pour rendre votre code jolie.

Si je demande à éditer cette valeur, j'aurai dans mon champ d'édition la valeur de la source HTML modifiée par `prettify.js` au lieu d'avoir la valeur du serveur. Par conséquent si j'enregistre, je viendrais écraser la valeur originale dans le fichier de variation par le nouveau code... toujours pas terrible.

On a vu plus haut que

*index.htm*

```html
<%- et(common, ['code',fc,true]) %>
```

irait chercher la valeur d'origine du serveur... mais ne modifierait pas le rendu en live.

Et bien, au lieu de passer `true`, passez plutôt du code JavaScript qui sera exécuté après chaque modification pour rendre le résultat en temps réel !

```html
<%- et(common, ['code',fc,'prettyPrint()']) %>
```

Ainsi à chaque modification, `prettify.js` sera rappeler et coloriera la nouvelle valeur insérée dans le DOM. Une fois validée, ce même processus ce répercutera sur l'ensemble des fenêtres ouvertes dans tous les autres navigateurs.

Vous pouvez toujours faire de même avec les variables spécifiques.

Vous pouvez également faire de même pour les modifications `editText`, `editHtml` et `editAttr` :

*index.htm*

```html
<%- et(common, ['code',fc,'some javascript function']) %>
<%- eh(common, ['code',fc,'some javascript function']) %>
<a href="<%- ea(common, ['code',fs,'href','some javascript function']) %>"></a>
```



### Manipulation de DOM et posibilité d'édition ###

#### Après un retour AJAX/Websocket ####

Les balises sensées être éditables ne le sont pas si elles sont arrivées après l'appel de `website.editAtlas()`. Pour les rendre éditables, il suffit d'exécuter en retour AJAX/Websocket la fonction `website.targetDataEditAtlas()`.

#### Après duplication d'une balise éditable (ou plusieurs) ####

En dupliquant un élément HTML éditable ou contenant des éléments éditables qui étaient présent dans le DOM lors de l'appel de `website.editAtlas()` ou de `website.targetDataEditAtlas()`, vous perdrez la possibilité d'éditer le clone. Pour le rendre éditable comme l'original, il faut tout d'abord le nettoyer avec `website.cleanDataEditAtlas($objetANettoyer)` pour nettoyer l'objet lui même et/ou tous ses éléments fils avant de l'injecter dans le DOM. Une fois fait, il ne vous reste qu'à exécuter la fonction `website.targetDataEditAtlas()`.





## Intégrer EditAtlas à votre site NodeAtlas ##

Malgré le nombre de fichier dans cet exemple, le coeur même utile d'EditAtlas pour vos propres sites node.js avec [NodeAtlas](http://www.lesieur.name/node-atlas/) tient dans quelques fichiers.



### Configuration minimal ###

Il vous faudra, pour faire fonctionner EditAtlas, activer le fichier de variations communes via `commonVariation`. Il vous faudra également activer la partie Back-end avec `controllersRelativePath` avec le modules node.js `socket.io`. Ce repository en donne un parfait exemple.



### Interface HTML ###

Il va faloir poser sur tous les templates contenant les fonctions d'édition `editHtml`, `editText` et `editAttr` l'inclusion suivante (normalement juste avant la fermeture de la balise `body`, avant vos balises scripts `script`) :

```html
<% include templates/edit-atlas.htm %>
```



### Phrase dans l'interface ###

L'interface elle-même est éditable et son contenu est à placer dans le fichier de variations communes :

```js
{
	...,
	"editableArea": {
		"close": "Fermer",
        "wysiwyg": "(Éditeur)",
        "plainText": "(Source)",
        "dockLeft": "⇤",
        "dockRight": "⇥",
        "anchor": "<ins>⚓</ins><del>X</del>",
        "cancelUpdate": "Annuler",
        "sourceInfo": "Cette valeur provenant du serveur, un rechargement de page peut-être nécessaire.",
        "title": "Zone d'édition de contenu",
        "next": "Continuer avant d'envoyer",
        "submit": "Modifier"
    },
    ...
}
```



### Habillage CSS ###

Il va falloir, pour habiller votre fenêtre d'édition et mettre en surbrillance les éléments éditables en maintenant « Ctrl + Alt + E », injecter la feuille CSS suivante :

```html
<link rel="stylesheet" type="text/css" href="stylesheets/edit-atlas.css" />
```



### Intéraction JavaScript ###

Pour permettre l'ouverture de votre popup il va falloir injecter le script suivant :

```html
<script type="text/javascript" src="javascript/edit-atlas.js"></script>
```

et lancer la fonction suivante dans votre JavaScript controlleur de page :

```js
website.editAtlas();
```



### Enregistrement côté serveur ###

Enfin, en vu d'enregistrer vos valeurs dans votre fichier de variation, il va falloir faire appel à deux fonctions dans votre controlleur commun.

- Pour enregistrer les valeurs et les répercuter à toutes les fenêtres ouvertes à l'intérieur de `io.sockets.on('connection', function (socket) { ... })` :

   ```js
	require('../components/controllers/edit-atlas').sockets(socket, NA, true);
```

- Ajoutez dans la fonction du contrôleur commun `changeVariation` les chemins vers vos variations et les fonctions d'édition :

   ```js
(function (publics) {
	"use strict";

	publics.changeVariation = function (params, mainCallback) {
		var variation = params.variation,
			NA = params.NA;

		variation.fs = ((variation.languageCode) ? variation.languageCode + "/": "") + variation.currentRouteParameters.variation;
		variation.fc = ((variation.languageCode) ? variation.languageCode + "/": "") + variation.webconfig.commonVariation;

		variation = require('../components/controllers/edit-atlas').setFilters(variation, NA);

		mainCallback(variation);
	};
}(website));
```



#### Dernières choses à faire ####

- Vous devez lancer le JavaScript client quand le DOM est prèt avec

   ```js
website.editAtlas();
```





## Mode Démo ##

Il est possible d'inhiber l'enregistrement dans les fichiers de variations mais de tout de même répercuter les changements dans toutes les pages ouvertes. C'est le mode démonstration. Par exemple avec le code suivant :

```js
website.components.editAtlas.sockets(socket, NA, true, NA.webconfig._modeDemo);
```

et le webconfig suivant :

```js
{
	...
	"_modeDemo": true
	...
}
```

*Note*: S'il n'y a pas de quatrième paramètre, les paramètres seront bien enregistrées.





## Désactiver la partie Front ##

Il est possible de ne pas générer les balises utilisées pour permettre au système l'édition temps réel. Le mécanisme ne fonctionnera plus mais cela est très utile pour manager les textes dans sa version de création avec un serveur local, et de s'en passer pour la version générée avec `--generate` et destinée à l'envoi extérieur.

```js
variation = website.components.editAtlas.setFilters(variation, NA, NA.webconfig._activateFront);
```

et le webconfig pour la version serveur suivant :

```js
{
	...
	"_activateFront": true
	...
}
```

et le webconfig pour la version de génération (utilisant `--generate`) suivant :

```js
{
	...
	"_activateFront": false
	...
}
```

*Note*: S'il n'y a pas de troisième paramètre, les balises supplémentaires seront générées.





## Utilisation avec SublimeAtlas ##

Il est également possible d'éditer des valeurs dans les composants utilisés par [SublimeAtlas](https://github.com/Haeresis/SublimeAtlas) grâce à la variable exposée `path`. Il faut pour exposer cette variable aux composants inclus dans les composants la passer en troisième paramètre `includeComponents('componentsPlaceholder', component, path)`.

Pour éditer un composant provenant du fichier `specific` c'est comme suit :

```html
<%- et(specific, [path + 'title', fs]) %>
<%- eh(specific, [path + 'content', fs]) %>
<%- ea(specific, [path + 'href', fs, 'href']) %>
```

Pour éditer un composant provenant du fichier `common` c'est comme suit :

```html
<%- et(common, [path + 'title', fc]) %>
<%- eh(common, [path + 'content', fc]) %>
<%- ea(common, [path + 'href', fc, 'href']) %>
```

Enfin, si votre composant peut provenir, en fonction des cas, du fichier `specific` ou du fichier `common`, faites comme suit :

```html
<%- et(eval(component.variation), [path + 'title', eval(component.file)]) %>
<%- eh(eval(component.variation), [path + 'content', eval(component.file)]) %>
<%- ea(eval(component.variation), [path + 'href', eval(component.file), 'href']) %>
```

En alimentant vos variables `variation` et `file` au même endroit que par exemple le `mainTag` (En savoir plus sur le [repository de SublimeAtlas](https://github.com/Haeresis/SublimeAtlas)).




## Lancer ce repository en local ##

Pour faire tourner le site en local, il vous faudra installer [NodeAtlas](http://www.lesieur.name/node-atlas/) sur votre poste de développement.

Déplacez vous ensuite dans le dossier :


```
\> cd </path/to/blog>
```

et utilisez la commande :

```
\> node </path/to/>node-atlas/node-atlas.js --browse
```

ou lancez `server.na` en double cliquant dessus :
- en expliquant à votre OS que les fichiers `.na` sont lancé par défaut par `node`,
- en ayant installé `node-atlas` via `npm install -g node-atlas`
- en étant sur que votre variable d'environnement `NODE_PATH` pointe bien sur le dossier des `node_modules` globaux.

Le site sera accessible ici :

- *http://localhost:7777/*





## Exemple en ligne ##

Vous pouvez voir fonctionner ce repository à l'adresse : [http://www.lesieur.name/edit-atlas/](http://www.lesieur.name/edit-atlas/).


-----


## International Version ##

### Overview ###

EditAtlas is an example for content filling without Back-office with [NodeAtlas](https://www.npmjs.com/package/node-atlas). Easy to implement, and easy to use ! It designs for:

 1. The publication of any text, HTML tag group or tag attribute in the client source.

 2. The edition change character by character in real time anywhere the phrase is displayed in the page.

 3. Update of all changes on every page already open in users' browsers without reloading them.

 4. Changing the text from the source server (disable features 2 and 3).

 5. Run functions after modification to re-render in real time the result (active features 4 and re-active 2 and 3).

 6. Stack and move your edit area in the popup window to keep an eye on the rendering behind.

 You can download this repository to test it or integrate it with any of your [NodeAtlas](http://www.lesieur.name/nodeatlas/) on node.js projects. This mechanism is currently used on [BookAtlas](https://github.com/Haeresis/BookAtlas/).

 A live example of this repository is testable at [http://www.lesieur.name/edit-atlas/](http://www.lesieur.name/edit-atlas/). *The only difference with the code of this repository is: the save in the variation files was inhibited. If you reload your page, you get back the test content.*



 ### How does it work ###

 [NodeAtlas](http://www.lesieur.name/nodeatlas/) has two types of variation files allowing you to inject different content for a given template:

 - a "common" file used by all templates and
 - a "specific" file for each template.

 This is useful to produce a model of the same HTML page multiple times or to create multilingual sites.


 #### Without edit, in built-in ####

 In a typical environment, with a configuration like this:

```js
{
	"controllersRelativePath": "controllers/",
	"commonController": "common.js",
	"commonVariation": "common.json",
	"routes": {
		"/": {
			"template": "index.htm",
			"variation": "index.json"
		}
	}
}
```

and putting in the common `common.json` variation file these variables:

*common.json*

```js
{
	"text": "<p>A text into common.</p>",
	"liens": [{
		"url": "./",
		"description": "The title of link into common.",
		"content": "The content of link into common."
	}]
}
```

and also into this variables into a specific `index.json` file:

*index.json*

```js
{
	"texts": ["<p>A text into specific.</p>"],
	"lien": {
		"url": "./",
		"description": "The title of link into specific.",
		"content": "The content of link into specific."
	}
}
```

we are able to display them in the template `index.htm` like this:

```html
<%- common.text %>
<a href="<%= common.liens[0].url %>" title="<%= common.liens[0].description %>">
	<%- common.liens[0].content %>
</a>

<%- specific.texts[0] %>
<a href="<%= specific.lien.url %>" title="<%= specific.lien.description %>">
	<%- specific.lien.content %>
</a>
```

and source code available in your browser at the following address: `http://localhost/` will be :

```html
<p>A text into specific.</p>
<a href="./" title="The title of link into common.">
	The content of link into common.
</a>

<p>A text into specific.</p>
<a href="./" title="The title of link into specific.">
	The content of link into specific.
</a>
```



#### Editable content in the fly ####

By changing the code above to this:

```html
<%- eh(common, ['text','common.json']) %>
<a href="<%- ea(common, ['liens[0].url','common.json','href']) %>" title="<%- ea(common, ['liens[0].description','common.json','title']) %>">
	<%- et(common, ['liens[0].content','common.json']) %>
</a>

<%- eh(specific, ['texts[0]','index.json']) %>
<a href="<%- ea(specific, ['lien.url','index.json','href']) %>" title="<%- ea(specific, ['lien.title','index.json','title']) %>">
	<%- et(specific, ['lien.content','index.json']) %>
</a>
```

You will then get the following output in the HTML source:

```html
<div *attributs...*><p>A text into common.</p></div>
<a *attributs...* href="./" title="The title of link into common.">
	<span *attributs...*>The content of link into common.</span>
</a>

<div *attributs...*><p>A text into specific.</p></div>
<a href="./" title="The title of link into specific.">
	<span *attributs...*>The content of link into specific.</span>
</a>
```

We can then see that:

- The `eh` function (shortcut of `editHtml`) generate an additional `div` wrapping your render. It an `block` area used for edit HTML text.
- The `et` function (shohtcut of `editText`) generate an additional `span` wrapping your render. It an `inline` area used for edit phrases, titles, menus, etc. All element we not contain a `block` type markup.
- The `ea` function (shohtcut of `editAttr`)  generate an additional attributes into the markup, but do not create a wrapping markup. This is useful for link edition, titles, images, or class, etc.

We also note that:

- For `editHtml`, `editText` and `editAttr`, it does not pass the variable but the object containing the variable. The value we pass in first is to view/edit and the second parameters is the json file in which the change will be registered.

**Therefore, our values ​​are clickable after push `ctrl + s` keys and editable in the edit window. Hold `ctrl + s` allow you to edit many value in same time.****



#### Management of publishing right / not specify saving file ####

Imagining that your common controller you to specify this:

```js
(function (publics) {
	"use strict";

	publics.changeVariation = function (params, mainCallback) {
		var variation = params.variation,
			session = params.request.session;

		// Create variable and setted them to false.
		variation.fs = false;
		variation.fc = false;

		// If the user are the right, we allowed edit files.
		if (session.hasPermissionForEdit) {
			// The specific file used to generate this view.
			variation.fs = ((variation.languageCode) ? variation.languageCode + "/": "") + variation.currentRouteParameters.variation;
			// The common file used to generate this view.
			variation.fc = ((variation.languageCode) ? variation.languageCode + "/": "") + variation.webconfig.commonVariation;
		}

		mainCallback(variation);
	};
}(website));

exports.changeVariation = website.changeVariation;
```

you could to check if a user can or can not edit the text. Similar implementation run in [BookAtlas](https://github.com/Haeresis/BookAtlas/).

So the above code could be written as following injection with variable `fs` and `fc`:

```html
<%- eh(common, ['text',fc]) %>
<a href="<%- ea(common, ['liens[0].url',fc,'href']) %>" title="<%- ea(common, ['liens[0].description',fc,'title']) %>">
	<%- et(common, ['liens[0].content',fc]) %>
</a>

<%- eh(specific, ['texts[0]',fs]) %>
<a href="<%- ea(specific, ['lien.url',fs,'href']) %>" title="<%- ea(specific, ['lien.title',fs,'title']) %>">
	<%- et(specific, ['lien.content',fs]) %>
</a>
```

In this case:

- if the user has the right, `fs` and `fc` provide the names of the files, and editing is possible but
- if the user has not the right, `fs` and `fc` are setted to `false` and edit is not allowed.

* Note: it is also necessary in the Back-end part to avoid registration in the json for security.*



### Special Case ###

Markup like `<option>` cannot contain child markup. It's also imposible to inject a value with `editText` (`et`) function :

```html
<select name="country"
	data-val="true"
	data-rule-required="true"
	data-msg-required="<%- ... %>">
	<option value=""><%- et(specific, ['country.label', fs]) %></option>
	<% for (var i = 0; i < specific.country.list.length; i++) { %>
		<option value="<% ... %>"><%- et(specific, ['country.list[' + i + '].text', fs]) %></option>
	<% } %>
</select>
```

The solution is to remplace the content and the close bracket by `editAttr` (`ea`) function with the third parameter the value `$text`. For keep safe auto-coloration of editor, is also recommanded to adopt the syntax below.

```html
<select name="country"
	data-val="true"
	data-rule-required="true"
	data-msg-required="<%- ... %>">
	<option value=""<%- ea(specific, ['country.label', fs, '$text']) + "</option" %>>
	<% for (var i = 0; i < specific.country.list.length; i++) { %>
		<option value="<%- ... %>"<%- ea(specific, ['country.list[' + i + '].text', fs, '$text']) + "</option" %>>
	<% } %>
</select>
```



#### Edit from the source on server ####

Consider the following value in the common variations of file:

*common.json*

```js
{
	"titleArticle": "This article has no title"
}
```

This value is intercepted in controller-side like this:

*common.js*

```js
(function (publics) {
	"use strict";

	publics.changeVariation = function (params, mainCallback) {
		var variation = params.variation,
			article;

		// Re sending information on an article from a value in the url.
		article = website.getArticle(/* Value into url */);

		// If the article has a title, then change the value of variation "titleArticle".
		if (article.title) {
			variation.titleArticle = article.title;
		}

		mainCallback(variation);
	};
}(website));

exports.changeVariation = website.changeVariation;
```

and it means this:

*index.htm*

```html
<%- et(common, ['articleTitle',fs]) %>
```

is not that it is into the variation file:

```html
This article has no title
```

but the article title:

```html
This is really a bird ?
```

If I ask to edit a value, I will have in my edit field of the HTML source "This is really a bird ?" in place of "This article has no title". So if I save, I will erase the original value in the variation file by the article title... not so good.

What we want, it's not the HTML source but the JSON source. For request it directly from the server, it's necessary to add following new parameter:

*index.htm*

```html
<%- et(common, ['articleTitle',fc,true]) %>
```

And the edit value will be "This article has no title". But the side effect it's you will not see modification in real time. This modification will not change the page already open in others' user browsers.

You could make same thing with specific variation, of course.

You could also make the same modifications with `editText`, `editHtml` et `editAttr`:

*index.htm*

```html
<%- et(common, ['articleTitle',fc,true]) %>
<%- eh(common, ['articleTitle',fc,true]) %>
<a href="<%- ea(common, ['articleTitle',fs,'href',true]) %>"></a>
```



#### Execute callback in real time ####

Consider the following value in the common variation:

*common.js*

```js
{
	"code": "<pre class=\"prettyprint linenums\"><code class=\"lang-html\">var test = 'Hello World';</code></pre>"
}
```

and you inject this value on the render page:

*index.htm*

```html
<%- eh(common, ['code',fc]) %>
```

That display in the source page, in client side:

```html
<pre class=\"prettyprint linenums\"><code class=\"lang-html\">var test = 'Hello World';</code></pre>
```

The point is, after execution of JavaScript client files, the source change and look like this:

```html
<pre class="prettyprint linenums prettyprinted">
	<ol class="linenums">
		<li class="L0">
			<code class="lang-js">
				<span class="kwd">var</span>
				<span class="pln"> test </span>
				<span class="pun">=</span>
				<span class="pln"> </span>
				<span class="str">'Hello World'</span>
			</code>
		</li>
	</ol>
</pre>
```

because `prettify.js` is used to pretiffy code.

If I ask to edit this value, I will in my edit field the HTML source value modified by `prettify.js` in place of server value. And if I save, I will erased the original value in the variation file with new code... not so good too.

We are see above this

*index.htm*

```html
<%- et(common, ['code',fc,true]) %>
```

will find value into original JSON file... but not allow real time modification.

So, in place of `true` in third parameter, use a JavaScript function into a string to render modifications in real time !

```html
<%- et(common, ['code',fc,'prettyPrint()']) %>
```

With that method, each modification `prettify.js` will be call to color the new value insert into the DOM. Once validated, the same process will be execute on all the windows open in all other browsers.

You can still do the same with specific variables.

You can also do the same for changes `editText`, `editHtml` and `editAttr`:

*index.htm*

```html
<%- et(common, ['code',fc,'some javascript function']) %>
<%- eh(common, ['code',fc,'some javascript function']) %>
<a href="<%- ea(common, ['code',fs,'href','some javascript function']) %>"></a>
```



#### DOM manipulation and editing posibility ####

##### After an AJAX/Websocket call #####

The HTML tags are not editable if they insert into DOM after calling of `website.editAtlas()`. To make them editable, just run back AJAX/Websocket the `website.targetDataEditAtlas()` function.

##### After cloning of editable markup (or multiple) #####

In cloning an editable HTML tag or containing editable elements that were present in the DOM when calling `website.editAtlas()` or ` website.targetDataEditAtlas()` , you will lose the ability to edit the clone. To make it editable as the original, it must first be cleaned with `website.cleanDataEditAtlas($objectToClean) ` to clean the object itself and / or its sons before injecting elements in the DOM. Once done, just run the `website.targetDataEditAtlas()` function.





### Embed EditAtlas to your NodeAtlas website ###

Despite the number of file in this example, the EditAtlas core useful for your own websites with node.js [NodeAtlas](http://www.lesieur.name/node-atlas/) is in some files.



#### Minimum Requirement ####

You will need to run EditAtlas, activate common variations file via `commonVariation`. You also need to activate the Back-end part with `controllersRelativePath` with node.js modules `socket.io`. This repository gives a perfect example.



#### HTML Interface ####

On all templates containing `editHtml`, `editText` and `editAttr` editing functions the following inclusion (usually just before the closing of the `body` tag before your `script` scripts tags):

```html
<% include templates/edit-atlas.htm %>
```



#### Sentences into interface ####

The interface itself is editable and its content is to place in the common variations of file:

```js
{
	...,
	"editableArea": {
		"close": "Close",
        "wysiwyg": "(Editor)",
        "plainText": "(Source)",
        "dockLeft": "⇤",
        "dockRight": "⇥",
        "anchor": "<ins>⚓</ins><del>X</del>",
        "cancelUpdate": "Cancel",
        "sourceInfo": "This value come from server, a page reloading is maybe necessary.",
        "title": "Editing Content Area",
        "next": "Continue before validation",
        "submit": "Update"
    },
    ...
}
```



#### CSS design ####

We'll have to dress up your editing window and highlight the editable items by holding "Ctrl + Alt + E", inject the following CSS:

```html
<link rel="stylesheet" type="text/css" href="stylesheets/edit-atlas.css" />
```



#### Interaction JavaScript ####

To allow the opening of your popup, you will have to inject the following script:

```html
<script type="text/javascript" src="javascript/edit-atlas.js"></script>
```

and run the following JavaScript function in your controller page:

```js
website.editAtlas();
```



#### Saving in server side ####

Finally, for save your values ​​in your variation file, we will have to use two common functions in your controller.

- Add in common `changeVariation` controller fonction the paths to your variations and editing functions :

   ```js
(function (publics) {
	"use strict";

	publics.changeVariation = function (params, mainCallback) {
		var variation = params.variation;
			NA = params.NA;

		variation.fs = ((variation.languageCode) ? variation.languageCode + "/": "") + variation.currentRouteParameters.variation;
		variation.fc = ((variation.languageCode) ? variation.languageCode + "/": "") + variation.webconfig.commonVariation;

		variation = require('../components/controllers/edit-atlas').setFilters(variation, NA);

		mainCallback(variation);
	};
}(website));
```

- To save the values ​​and pass them all open windows within `io.sockets.on('connection', function (socket) { ... })`:

   ```js
	require('../components/controllers/edit-atlas').sockets(socket, NA, true);
```



#### Last thing to do ####

- You must start the front JavaScript when the DOM is ready with

   ```js
website.editAtlas();
```





## Demo Mode ##

It's possible to desactivated record into variations files but conserve update propagation in real time in current opened windows. It's demo mode. For example with the following code :

```js
website.components.editAtlas.sockets(socket, NA, true, NA.webconfig._modeDemo);
```

and this webconfig :

```js
{
	...
	"_modeDemo": true
	...
}
```

*Note*: Without fourth parameter, variations are recorded.





## Desactivate the Front part ##

It's possible to not generate extra markup required for EditAtlas functionality. It's useful for managing two versions : for example a real time version with mechanism and a `--generate` version without mechanism.
```js
variation = website.components.editAtlas.setFilters(variation, NA, NA.webconfig._activateFront);
```

and a webconfig for real-time version :

```js
{
	...
	"_activateFront": true
	...
}
```

and a webconfig for generated version (with `--generate`) :

```js
{
	...
	"_activateFront": false
	...
}
```

*Note*: Without third parameter, extra markup will be generated.





## Using with SublimeAtlas ##

It's also possible to edit values into component used by [SublimeAtlas](https://github.com/Haeresis/SublimeAtlas) thanks to `path` variable. To work with it, it's important to pass it in third parameter `includeComponents('componentsPlaceholder', component, path)`.

To edit a value in component from `specific` file, use that :

```html
<%- et(specific, [path + 'title', fs]) %>
<%- eh(specific, [path + 'content', fs]) %>
<%- ea(specific, [path + 'href', fs, 'href']) %>
```

To edit a value in component from `common` file, use that :

```html
<%- et(common, [path + 'title', fc]) %>
<%- eh(common, [path + 'content', fc]) %>
<%- ea(common, [path + 'href', fc, 'href']) %>
```

Then, if the component variation called from `specific` or `common`, use that :

```html
<%- et(eval(component.variation), [path + 'title', eval(component.file)]) %>
<%- eh(eval(component.variation), [path + 'content', eval(component.file)]) %>
<%- ea(eval(component.variation), [path + 'href', eval(component.file), 'href']) %>
```

With `variation` and `file` used from same place of `mainTag` (Know more on [SublimeAtlas repository](https://github.com/Haeresis/SublimeAtlas)).





### Run the website in local server ###

To run the website in local, you must install [NodeAtlas](http://www.lesieur.name/node-atlas/) on your development machine.

Then you move into the folder:


```
\> cd </path/to/edit>
```

and use the command:

```
\> node </path/to/>node-atlas/node-atlas.js --browse
```

or run `server.na` by double clicking and:
- explaining your OS that .na files are run by default with node,
- having installed node-atlas via npm install -g node-atlas
- being on your environment variable NODE_PATH is pointing to the global node_modules folder.

The website will be to:

- *http://localhost:7777/*





### Online Example ###

You can see this repository running at: [http://www.lesieur.name/edit-atlas/](http://www.lesieur.name/edit-atlas/).