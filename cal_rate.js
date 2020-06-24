var srr = document.querySelector('.SRR');
var sr2r = document.querySelector('.SR2R');

srr.addEventListener('change', typeII_rate_Calculate);
sr2r.addEventListener('change', typeI_rate_Calculate);

function typeII_rate_Calculate(e) {
  var y = 100 - parseFloat(e.target.value);
  document.getElementById("_sr2r").innerHTML = 'Purchase Probability - TypeII<input type="number" class="SR2R" id="SR2R" max="100" min="0" value=' + y + ' style="width: 75px;">%';
}

function typeI_rate_Calculate(e) {
  var y = 100 - parseFloat(e.target.value);
  document.getElementById("_srr").innerHTML = 'Purchase Probability - TypeI<input type="number" class="SRR" id="SRR" max="100" min="0" value=' + y + ' style="width: 75px;">%';
}
