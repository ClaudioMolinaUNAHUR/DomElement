/**
 * A DomElement is the main constructor for objects that represent
 * the Dom hierarchy.
 */
function DomElement(type, childrenDefinition) {
    this.type = type;
    this.styles = {};
    this.children = []; //childrens del DOM

    for (let index = 0; index < (childrenDefinition || []).length; index++) {
        var definition = childrenDefinition[index];
        var newElement = new DomElement(definition.type, definition.children);
        newElement.__proto__ = this;
        this.children.push(newElement);
    }
}
/**
 * All Dom elements know how to print themselves
 */
DomElement.prototype.toString = function(indent) {
    if (!indent) {
        indent = 0;
    }
    var result = ' '.repeat(indent);
    result = result + 'Node ' + this.type + ' {';
    var styleKeys = Object.keys(this.styles);
    for (let index = 0; index < styleKeys.length - 1; index++) {
        var styleKey = styleKeys[index];
        result = result + styleKey + ':' + this.styles[styleKey] + ', '
    }
    if (styleKeys.length > 0) {
        result = result + styleKeys[styleKeys.length - 1] + ':' + this.styles[styleKeys[styleKeys.length - 1]];
    }
    result = result + '}'
    for (let index = 0; index < this.children.length; index++) {
        var element = this.children[index];
        result = result + "\n" + element.toString(indent+2);
    }
    return result;
}


var definition = {
    type: 'html',
    children: [{
        type: 'head' //0 html
    }, {
        type: 'body', //1 html <-
        children: [{
            type: 'div', //0 body
            children: [{
                type: 'div', //0 div <-
                children: [{
                    type: 'h1' //0 div2
                }, {
                    type: 'p'  //1 div2
                }, {
                    type: 'p'  //2 div2
                }]
            }, {
                type: 'section', //1 div
                children: [{
                    type: 'h1'  //0 section
                }, {
                    type: 'p'   //1 section
                }, {
                    type: 'p'   //2 section
                }]
            }]
        }, {
            type: 'aside', //1 body
            children: [{
                type: 'h1'  //0 aside
            }, {
                type: 'p'   //1 aside
            }, {
                type: 'p'   //2 aside
            }]
        }]
    }]
}

/*
 * La raiz del dom será el primer elemento de nuestras definiciones.
 */
var dom = new DomElement(definition.type, definition.children);

/*
Podemos probar añadir unos estilos y ver que sucede
*/

dom.children[1].styles = {
    background: 'red',
    color: 'blue'
};

dom.children[1].children[0].children[0].styles = {
    size: 17,
    color: 'green'
};

console.log(' ')
//console.log(dom.toString(), "toString");
/**************** PUNTO 1 ******************************/

/*
Queremos poder contar con una definición de estilos como a la siguiente.
*/
var styles = {
    'body section': {
        color: 'green',
        size: 25
    },
    'body': {
        background: 'black'
    },
    'h1': {
        size: 50,
        color: 'red'
    },
    'aside h1': {
        size: 30
    }
};

/*
El objetivo, es poder aplicar esos estilos a cada elemento del dom
según indique la regla asociada.
Ej. si la regla es "h1", entonces el estilo se aplica a todos los elementos
de tipo h1, pero si es "body h1" entonces se aplica a los h1 que están
dentro de body.

Más aún, los estilos se heredan según jerarquía. Si por ejemplo, si
"body" tiene color "red", entonces todos los hijos de body también
tendrán color "red", salvo que haya una regla que indique lo contrario.

Se pide entonces que implemente el comportamiento de getStyle
para que se le pueda preguntar a cualquier elemento del dom por sus
estilos completos, que incluyen tanto los declarados como los heredados.

Luego cree un metodo "viewStyleHierarchy" que imprima todos los nodos
con sus estilos completos (los propios y heredados), de forma similar a
toString (pero con tooooooodos los estilos).
*/
//-----FUNCION PARA GENERAR LAS HERENCIAS----
DomElement.prototype.buildHierarchy = function(){
    for (let i = 0; i < this.children.length; i++) {      
        this.children.forEach( child => {
            //--itero el children , y si algun estilo del padre no esta en el hijo, se agrega 
            for (key in this.styles){
                if(!child.styles.hasOwnProperty(`${key}`)){
                    let styles = child.styles
                    let atributo = this.styles[key]
                    child.styles = {...styles,[key]: atributo} //conservo todos los estilos declarado, y reemplazo cuando no tengo alguno
                }
            }                
        });
    this.children[i].buildHierarchy();
    }
};

DomElement.prototype.addStyle = function(defNodos, styles){
    var arrayNodos = defNodos.split(' ')
    let self = this
    const put = (arrayNodos, nodo, toCompare = ' ') => {
        for (let i = 0; i < nodo.children.length; i++) {
            for (let j = 0; j < arrayNodos.length; j++) {
                console.log(defNodos == toCompare.trim())
                if(defNodos == toCompare.trim()){
                    nodo.children[i].styles = styles
                }else if(arrayNodos[j] == nodo.children[i].type){
                    toCompare += nodo.children[i].type + " "
                }
            }                
            put(arrayNodos, nodo.children[i], toCompare)             
        }
    }
    put(arrayNodos, self)
}
//---------TEST----------
// dom.addStyle('body section', {
//     color: 'green',
//     size: 25
// })
// console.log(dom.toString())


DomElement.prototype.getStyle = function (type){
    let self = this
    this.buildHierarchy();
    const get = (type, node, result = '') => {
        for (let i = 0; i < node.children.length; i++) {
            if (node.children[i].type == type){
                result += node.children[i].type + ":" + JSON.stringify(node.children[i].styles) + "\n";
            }
            result = get(type, node.children[i], result);
        };            
       return result
    }
    let fullStyle = get(type, self)
    return fullStyle;
};
//-------TEST---------
//console.log(dom.getStyle('h1'))

DomElement.prototype.viewStyleHierarchy = function (){
    this.buildHierarchy();
    return this.toString();
};
//-------TEST---------
//console.log(dom.viewStyleHierarchy())


/**************** PUNTO 2 ******************************/

/*
Queremos agregar la idea de eventos, para que distintos elementos
del DOM puedan reaccionar ante diversos eventos.
Cada elemento del dom debe entender tres metodos más:

* on(nombreDeEvento, handler)
* off(nombreDeEvento)
* handle(nombreDeEvento)

Por ejemplo, podemos decir

dom.children[1].children[0].children[0].on('click', function() {
    console.log('Se apretó click en html body div div');
    return true;
})

El código de la función queda asociado al evento 'click' para ese
elemento del dom, y se activará cuando se haga el handle del evento.

dom.children[1].children[0].children[0].handle('click');


El tema es que queremos poder usar 'this' en la función para referirnos
al objeto que acaba de hacer el "handle" de la función. Ej.

dom.children[1].children[0].children[0].on('click', function() {
    console.log('Se apretó click en un ' + this.type);
    return true;
})

Por otro lado, cuando se hace el handling de un evento, este realiza
el proceso de bubbling-up, es decir, todo padre que también sepa manejar
el evento del mismo nombre debe activar el evento.

Por ejemplo, si activamos 'click' en dom.children[1].children[0].children[0]
y dom.children[1] también sabe manejar 'click', entonces, luego de ejecutar
el 'click' para dom.children[1].children[0].children[0], se deberá hacer el
bubbling-up para que dom.children[1] maneje 'click'. Hay una excepción, sin
embargo. Cuando el handler de un hijo describe falso luego de ejecutar,
el bubbling-up se detiene.

off por su parte, desactiva el handler asociado a un evento.

Se pide entonces que realice los cambios pertinentes para que los elementos
del dom puedan tener este comportamiento.
*/
DomElement.prototype.on = function(event, fx){
    this.eventElement = { event, fx };
};
DomElement.prototype.off = function(event){
    if (this.eventElement.event == event) {this.eventElement = {}};
};
DomElement.prototype.handle = function(event){
    if (this.__proto__.type != null && this.eventElement.event == event){        
        if(this.eventElement.fx.bind(this)()){ 
            this.__proto__.eventElement = this.eventElement;
            this.__proto__.handle(event); 
        };
    }else if(this.type == 'html' && this.eventElement.event == event){
        this.eventElement.fx.bind(this)();
    };
};
//-------TEST---------
// dom.children[1].children[0].children[0].on('click', 
//     function(){console.log("me hizo click: " + this.type); return true})

// console.log(dom.children[1].children[0].children[0].handle('click'))

// dom.children[1].children[0].children[0].on('click', 
//     function(){console.log("me hizo click: " + this.type); return false})

// console.log(dom.children[1].children[0].children[0].handle('click'))

// dom.children[1].children[0].children[0].off('click')
// console.log(dom.children[1].children[0].children[0].eventElement)



/**************** PUNTO 3 ******************************/

/*
Queremos poder mostrar los nodos del dom de forma bonita
en la terminal, mediante el metodo display.

dom.display()

No todo nodo es visible sin embargo. Solo los elementos del body
deben mostrarse en este caso, ya que el head y html son solo
contenedores. Lo mismo ocurre con div, section y aside, que son
elementos invisibles.

Así, en este caso, solo vamos a mostrar los elementos h1 y p.
Pero ¿Qué mostramos de ellos? Para hacer la cosa más divertida, vamos
a agregar un atributo "contents" que nos permita agregar un texto
a esos elementos como contenido. Ese texto será el que se muestre
cuando llamemos a display.

Más aún, cada elemento se muestra de forma distinta según su tipo.
p muestra contents tal cual, pero h1 lo muestra todo en mayúscula, siempre.
Además el color del texto y del fondo depende del estilo del elemento,
(Ver https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color)
*/
//npm install cli-color
var clc = require("cli-color");

DomElement.prototype.display = function(){
    var result = '';
    for (let i = 0; i < this.children.length; i++) {
        if(Object.keys(this.children[i]).includes('contents')){
            if(this.children[i].type == 'h1'){
                this.children[i].contents = this.children[i].contents.toUpperCase(); 
            }
            let color = this.children[i].styles.color || 'black';
            let background = this.children[i].styles.background || 'white';
            let capitalizedBg = 'bg' + background.charAt(0).toUpperCase() + background.slice(1);
            result += clc[`${color}`][`${capitalizedBg}`](this.children[i].contents) + "\n" + this.children[i].display();
        }else{
            result += this.children[i].display();
        };
    };
    return result;
}
//-------TEST---------
// dom.children[1].children[0].children[0].children[0].contents = 'soy un h1'
// dom.children[1].children[0].children[0].children[0].styles = {color: 'blue'}

// dom.children[1].children[0].children[0].children[1].contents = 'soy un p'
// dom.children[1].children[0].children[0].children[1].styles = {color: 'red', background: 'green'}

// dom.children[1].children[0].children[0].children[2].contents = 'soy el p siguiente'
// console.log(dom.display())

//console.log(DomElement.prototype)