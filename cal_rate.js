d3.select(".SRR")
 .on("change", function (params) {
   document.getElementById("SR2R").value = 100-this.value;
 })
d3.select(".SR2R")
  .on("change", function (params) {
    document.getElementById("SRR").value = 100 - this.value;
  })