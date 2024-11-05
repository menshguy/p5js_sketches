/**
 * 1. Add a div with ID <div id="subnav-container"></div>
 * 2. Make the path to nav.html dynamic, such that it works in prod & dev 
 *    and from root & subdirectories.
 */
fetch("./versionnav.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("versionnav-container").innerHTML = data;
    })
    .catch(error => console.error("Error loading navigation:", error));