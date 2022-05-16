export default function statusBarTransition(message, transitionDuration) {
    var el = document.getElementById("status-bar");
    el.style.opacity = "1";
    window.setTimeout(function(){
      el.style.opacity="0";
    }, transitionDuration);
}