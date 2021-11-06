const Voila = {app: {el: null}}
;(function(){
    class voila {
        constructor(modules){
            this.delimiters = ['{', '}']
            this.stateObject = []
            this.proxyRender = ({prop, val}) => {}
            const startSucess = typeof VoilaInstance == 'undefined'
            if(startSucess){
                console.error("VoilaInstance não foi instanciado")
                return
            }
            this.modules = modules
            VoilaInstance.proxyRender = this.proxyRender
            VoilaInstance.stateObject = []
            VoilaInstance.proxyRenderMethods = this.proxyRenderMethods
            VoilaInstance.inputModel = this.inputModelE
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
                        target[prop] = val;
                        VoilaInstance.methods.state[prop] = val
                    } catch (error) {
                    }
                }
            });
            VoilaInstance.methods.state = new Proxy(VoilaInstance.methods.state, { // (*)
                set(target, prop, val, receiver) { // to intercept property writing
                    Reflect.set(target, prop, val, receiver);
                    target[prop] = val
                    VoilaInstance.proxyRenderMethods({prop})
                }
            });
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
                            VoilaInstance.stateObject.push({state, index, textContent: null})
                        }
                    })
                    return true    
                })(voilaStates) : ``
            } catch (error) {
                console.error(error)
            }
        }
        buildDom(){
            const nodeC = this.el.childNodes
            VoilaInstance.cloneNode = 
            this.el.childNodes.forEach((child, index) => {
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
                    child.removeAttribute(`v-model`)
                } 
            }
        }
        inputModelE(val){
            document.querySelectorAll(`input`).forEach((input) => {
                input.value = val
            })
        }
        firstBildDom(){
            this.el.childNodes.forEach((child, index) => {
                this.inputModel(child)
                const foundState = VoilaInstance.stateObject.find(state => state.index == index)
                if(foundState){
                    foundState.textContent = child.textContent
                    let newReplace = foundState.textContent
                    const replaceState = newReplace.replaceAll(foundState.state, VoilaInstance.state[foundState.state]).replaceAll(`{`, ``).replaceAll(`}`,``)
                    child.textContent = replaceState
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
            const foundState = VoilaInstance.stateObject.filter(state => state.state == prop)
            if(foundState){
                foundState.forEach((state) => {
                    VoilaInstance.el.childNodes.forEach((child, index) => {
                        if(state.index == index && state.textContent){
                            let newReplace = state.textContent
                            const replaceState = newReplace.replaceAll(state.state, VoilaInstance.state[prop]).replaceAll(`{`, ``).replaceAll(`}`,``)
                            child.textContent = replaceState
                            VoilaInstance.inputModel(VoilaInstance.state[prop])
                        }
                    })
                })
            }
        }
        proxyRenderMethods({prop}){
            const foundState = VoilaInstance.stateObject.filter(state => state.state == prop)
            if(foundState){
                foundState.forEach((state) => {
                    VoilaInstance.el.childNodes.forEach((child, index) => {
                        if(state.index == index && state.textContent){
                            let newReplace = state.textContent
                            const replaceState = newReplace.replaceAll(state.state, VoilaInstance.state[prop]).replaceAll(`{`, ``).replaceAll(`}`,``)
                            child.textContent = replaceState
                            VoilaInstance.inputModel(VoilaInstance.state[prop])
                        }
                    })
                })
            }
        }
    }
    this.modules = []
    this.body = null
    Voila.app = new voila(this.modules)
})()