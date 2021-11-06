const Voila = {app: {el: null}}
;(function(){
    class voila {
        constructor(modules){
            this.delimiters = ['{', '}']
            this.stateObject = []
            this.proxyRender = ({prop, val}) => {}
            const startSucess = typeof VoilaInstance == 'undefined'
            if(startSucess){
                console.error("[Voila] => VoilaInstance não foi instanciado.")
                return
            }
            this.modules = modules
            this.addStateDefault()
            VoilaInstance.proxyRender = this.proxyRender
            VoilaInstance.stateObject = []
            VoilaInstance.proxyRenderMethods = this.proxyRenderMethods
            VoilaInstance.inputModel = this.inputModelE
            VoilaInstance.vModel = [`INPUT`]
            VoilaInstance.dinamicAttr = this.dinamicAttr
            this.el = document.querySelectorAll(VoilaInstance.el)[0]
            VoilaInstance.el = this.el
            this.buildDom()
            Object.keys(VoilaInstance.methods).forEach(function(key, index) {
                VoilaInstance.methods.state = VoilaInstance.state
            });
            VoilaInstance.state = new Proxy(VoilaInstance.state, { // (*)
                set(target, prop, val, receiver) { // to intercept property writing
                    try {
                        Reflect.set(target, prop, val, receiver);
                        VoilaInstance.methods.state[prop] = val
                    } catch (error) {
                    }
                }
            });
            VoilaInstance.methods.state = new Proxy(VoilaInstance.methods.state, { // (*)
                set(target, prop, val, receiver) { // to intercept property writing
                    Reflect.set(target, prop, val, receiver);
                    VoilaInstance.proxyRenderMethods({prop, receiver})
                }
            });
        }
        addStateDefault(){
            const array = [`Math.PI`, `Math.LN2`, `window.location.href`, `window.location.pathname`,
            `window.location.origin`, `window.location.port`
            ]
            array.forEach((state) => {
                VoilaInstance.state[state] = eval(state)
            })
        }
        validState({child, index}){
            try {
                const voilaStates = this
                const arrayState = child.textContent.trim().split(this.delimiters[0])
                return arrayState.length > 0 ? ((voilaStates) => {
                    arrayState.forEach((stateT) => {
                        const state = stateT.trim().split(`}`)[0].trim()
                        if(state.trim().length > 0){
                            if(!VoilaInstance.state[state]) return ``
                            VoilaInstance.stateObject.push({state, index, textContent: child.textContent, child: null})
                        }
                    })
                    return true    
                })(voilaStates) : ``
            } catch (error) {
                console.error(error)
            }
        }
        dinamicAttr(child){
            try {
                const attrs = child.getAttributeNames()
                attrs.forEach((attr) => {
                    if(attr[0] == `:`){
                        const attre = attr.replace(`:`, ``)
                        const state = VoilaInstance.state[child.getAttribute(attr)]
                        const found = VoilaInstance.stateObject.find(e => e.state == child.getAttribute(attr))
                        if(found){
                            const index = VoilaInstance.stateObject.indexOf(found)
                            VoilaInstance.stateObject[index].child = child
                            VoilaInstance.stateObject[index].dinamicAttr = true
                            VoilaInstance.stateObject[index].attr = attre
                        }
                        child.setAttribute(attre, state)
                    }
                })
            } catch (error) {
                
            }
        }
        buildDom(){
            VoilaInstance.template ? VoilaInstance.el.innerHTML = VoilaInstance.template : ``
            try {
                if(!document.querySelector(this.el)){
                    console.error(`[Voila] => ${this.el} não existe no contexto atual.`)
                    return
                }
            } catch (error) {
                //
            }
            const nodeC = this.el.childNodes
            this.el.childNodes.forEach((child, index) => {
                this.dinamicAttr(child)
                this.validState({child, index})
            })
            this.firstBildDom()
        }
        inputModel(child){
            if(child.tagName == `INPUT`){
                const state = child.getAttribute(`v-model`)
                if(state){
                    child.value = VoilaInstance.state[state]
                    child.addEventListener(`keyup`, () => {
                        VoilaInstance.methods.state[state] = child.value
                    });
                } 
            }
        }
        inputModelE(val, state){
            document.querySelectorAll(`input`).forEach((input) => {
                if(input.getAttribute(`v-model`) == state){
                    input.value = val
                }
            })
        }
        stateReplaceEval(state){
            
        }
        firstBildDom(){
            this.el.childNodes.forEach((child, index) => {
                this.dinamicAttr(child)
                this.inputModel(child)
                const foundState = VoilaInstance.stateObject.find(state => state.index == index)
                if(foundState){
                    foundState.textContent = child.textContent
                    let newReplace = foundState.textContent
                    VoilaInstance.stateObject.forEach((stateE) => {
                        const replaceState = newReplace.replaceAll(stateE.state, VoilaInstance.state[stateE.state]).replaceAll(`{`, ``).replaceAll(`}`,``)
                        child.textContent = replaceState
                    })
                    try {
                        const attrs = child.getAttributeNames()
                        attrs.forEach((attr) => {
                            const attrOld = attr
                            attr = attr.replace(`@`, ``)
                            const attributeName = child.getAttribute(attrOld)
                            child.addEventListener(attr, () => {
                                VoilaInstance.methods[attributeName]()
                            });
                            child.removeAttribute(attrOld)
                        })
                    } catch (error) {
                        //console.error(error)
                    }
                }
            })
        }
        proxyRender({prop}){
            try {
                const foundState = VoilaInstance.stateObject.filter(state => state.state == prop)
                if(foundState){
                    foundState.forEach((state) => {
                        VoilaInstance.el.childNodes.forEach((child, index) => {
                            if(state.index == index && state.textContent){
                                let newReplace = state.textContent
                                VoilaInstance.stateObject.forEach((stateE) => {
                                    const replaceState = newReplace.replaceAll(stateE.state, VoilaInstance.state[prop]).replaceAll(`{`, ``).replaceAll(`}`,``)
                                    child.textContent = replaceState
                                    VoilaInstance.inputModel(VoilaInstance.state[prop])
                                })
                            }
                        })
                    })
                }
            } catch (error) {
                
            }
        }
        proxyRenderMethods({prop, receiver}){
            try {
                const foundState = VoilaInstance.stateObject.filter(state => state.state == prop)
                if(foundState){
                    foundState.forEach((state) => {
                        VoilaInstance.el.childNodes.forEach((child, index) => {
                            if(state.index == index && state.textContent){
                                let newReplace = state.textContent
                                VoilaInstance.stateObject.forEach((stateE) => {
                                    const replaceState = newReplace.replaceAll(stateE.state, VoilaInstance.state[prop]).replaceAll(`{`, ``).replaceAll(`}`,``)
                                    child.textContent = replaceState
                                    VoilaInstance.inputModel(VoilaInstance.state[prop], stateE.state)
                                    VoilaInstance.dinamicAttr(VoilaInstance.stateObject.find(e => e.stateE == stateE.state).child)
                                })
                            }
                        })
                    })
                }
            } catch (error) {
                
            }
        }
    }
    this.modules = []
    this.body = null
    Voila.app = new voila(this.modules)
})()