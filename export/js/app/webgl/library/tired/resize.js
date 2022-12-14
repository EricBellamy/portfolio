window.tired.resize = {
    events: [],
    debouncedResize: false,
    watch: function(fps){
        const msDelay = 1000 / fps;
        if(window.tired.resize.debouncedResize){
            window.removeEventListener("resize", window.tired.resize.debouncedResize, true);
        }
        const debouncedResize = window.tired.debounce(function(){
            const events = this.events;
            for(const event of events){
                event();
            }
        }.bind(window.tired.resize), msDelay, {
            maxWait: msDelay
        });
        window.addEventListener("resize", debouncedResize, true);
        window.tired.resize.debouncedResize = debouncedResize;
    }
}