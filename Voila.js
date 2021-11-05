const Voila = {app: {el: null}}
;(function(){
    class voila {
        constructor(modules){
            this.modules = modules
            this.el = document.querySelectorAll(VoilaInstance.el)[0]
            this.state = VoilaInstance.state || {}
            modules[0]({
                element: this.el
            })
        }
        
    }
    this.modules = []
    this.body = null
    function VoilaExec({element, state, methods, mounted}){
        
    }
    function subscribeWindow(callback){
        this.modules.push(callback)
    }
    subscribeWindow(VoilaExec)
    Voila.app = new voila(this.modules)
})()
