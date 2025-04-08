<meting-widget class="meting" id="meting">
</meting-widget>

<script>
import { onMount } from "svelte";

class MetingWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css";
        this.shadowRoot.appendChild(style);

        const scriptAPlayer = document.createElement("script");
        scriptAPlayer.src = "https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js";
        this.shadowRoot.appendChild(scriptAPlayer);

        const scriptMeting = document.createElement("script");
        scriptMeting.src = "https://cdn.jsdelivr.net/npm/meting@2/dist/Meting.min.js";
        this.shadowRoot.appendChild(scriptMeting);

        const metingJs = document.createElement("meting-js");
        metingJs.setAttribute("server", "netease");
        metingJs.setAttribute("type", "playlist");
        metingJs.setAttribute("id", "7245850391");
        metingJs.setAttribute("order", "random");
        metingJs.setAttribute("list-folded", "true");
        this.shadowRoot.appendChild(metingJs);
    }
}
onMount(() => {
    if (!window.customElements.get("meting-widget")) {
        window.customElements.define("meting-widget", MetingWidget);
    }
    window.onload = () => {
        const metingWidget = document.querySelector("meting-widget");
        const metingjs = metingWidget.shadowRoot.querySelector("meting-js");
        metingjs._init();
        metingjs._parse();
    }
})
</script>