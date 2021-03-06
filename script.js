// d3 animation
const margin = {
    top: 60,
    right: 40,
    bottom: 50,
    left: 100
  },
  width = 900,
  height = 300

const svg = d3.select(".animation").append("svg").attr("width", width)
  .attr("height", height + margin.top + margin.bottom)
  .append("g");

svg.append("rect")
  .attr("width", 500)
  .attr("height", 250)
  .attr("x", (width - 500) / 2)
  .attr("y", (height + margin.top + margin.bottom - 250) / 2)
  .style("fill", "white");

svg.append("image")
  .attr("xlink:href", "3081162.svg")
  .attr("width", 120)
  .attr("height", 120)
  .attr("x", width - 270)
  .attr("y", (height + margin.top + margin.bottom - 250) / 2 - 70)
// .attr("transform", "rotate(45)")
var q_count = 0;
var s_count = 0;
var o_count = 0;
var simulate_id = 0;
var send = document.querySelector('.send');
send.addEventListener('click', clear_count, false);
send.addEventListener('click', run, false);

function run() {
  var open_time = document.querySelector('.time').value;
  var open_time_hour = open_time[0] + open_time[1]
  var open_time_min = open_time[3] + open_time[4]
  open_time = parseInt(open_time_hour * 3600 + open_time_min * 60);
  var open_time2 = open_time;
  var arrival_rate = document.querySelector('.AR').value;
  arrival_rate = parseFloat(arrival_rate);
  var leaving_rate = document.querySelector('.leave_rate').value;
  leaving_rate = parseFloat(leaving_rate);
  var service_rate = document.querySelector('.SR').value;
  service_rate = parseFloat(service_rate);
  var service_rate2 = document.querySelector('.SR2').value;
  service_rate2 = parseFloat(service_rate2);
  var order_rate = document.querySelector('.order').value;
  order_rate = parseFloat(order_rate);
  var offline_service_rate = 1 / (1 / service_rate + 1 / order_rate);
  var offline_service_rate2 = 1 / (1 / service_rate2 + 1 / order_rate);
  var typeI_rate = document.querySelector('.SRR').value;
  typeI_rate = parseFloat(typeI_rate);
  var typeII_rate = document.querySelector('.SR2R').value;
  typeII_rate = parseFloat(typeII_rate);
  var speed = document.querySelector('.SS').value;
  speed = 1000 - parseFloat(speed);
  var const_servicetime = 1 / service_rate * 60;
  var const_servicetime2 = 1 / service_rate2 * 60;
  var const_offline_servicetime = 1 / offline_service_rate * 60;
  var const_offline_servicetime2 = 1 / offline_service_rate2 * 60;
  var servers_num = document.querySelector('.S').value;
  servers_num = parseInt(servers_num);
  var servers = {
    name: [],
    end_time: []
  };

  //用物件陣列紀錄服務生名字和他上一次結束的時間，預設為0
  for (var i = 0; i < servers_num; i++) {
    servers.name.push('staff ' + (i + 1));
    servers.end_time.push(0);
  }
  var run = document.querySelector('.R').value;

  //第一位客人來的時間
  var arrival_time = open_time + (-1 / arrival_rate) * (Math.log(Math.random() / Math.log(2.718)) * 60);

  //初始等待人數
  var queue = 0;

  //第一位客人的開始時間等於他到達的時間
  var start_time = arrival_time;
  var str = "<table border='1' class='table table-striped table-dark' style='margin - bottom: 0'><thead> <tr><th scope='col'>Cust #</th><th>Order Drink Type</th><th>Arrival Time</th><th>Start Time</th><th>End Time</th><th>Service Time</th><th>Served by</th></tr></thead><tbody>";
  var end_time = 0;
  var min_end_time = 1;
  var who_service_now = 0;

  var customer_data = {
    id: [],
    arrival_time: [],
    start_time: [],
    end_time: [],
    inq: [],
    ins: [],
    out: [],
    type: [],
  };

  // run: 模擬幾次
  for (var i = 1; i <= run; i++) {
    var customer_type;
    if (Math.random() > (typeI_rate / 100)) {
      customer_type = 2;
    } else {
      customer_type = 1;
    };

    //每次的服務時間
    if (customer_type == 2) {
      do {
        var servicetime = parseInt(60 * randomExponential(service_rate2));
      } while (servicetime >= (const_servicetime2 + 20) || servicetime <= (const_servicetime2 - 20));
    } else {
      do {
        var servicetime = parseInt(60 * randomExponential(service_rate));
      } while (servicetime >= (const_servicetime + 20) || servicetime <= (const_servicetime - 20));
    }

    //記下起始時間
    var tmp_time = open_time;
    var start_time_temp = 0;
    arrival_time += (-1 / arrival_rate) * (Math.log(Math.random() / Math.log(2.718)) * 60);
    for (j = servers_num; j > 0; j--) { //找出服務生中最早的完成時間
      if (servers.end_time[j - 1] < min_end_time) {
        who_service_now = j - 1;
        // console.log(servers.end_time[j - 1])
        min_end_time = servers.end_time[j - 1];
      }
    }

    if (servers.end_time[who_service_now] <= arrival_time) { //如果進場時間大於上次服務時間(服務生有空)
      start_time = arrival_time;
      start_time_temp = start_time
      servers.end_time[who_service_now] += servicetime;

    } else { //沒有服務生有空
      //顧客是否不願意等
      if (Math.random() > (leaving_rate / 100)) {
        //not leave
        start_time = servers.end_time[who_service_now];
        start_time_temp = start_time;
        servers.end_time[who_service_now] += servicetime;
      } else {
        //leave
        start_time = arrival_time;
        start_time_temp = servers.end_time[who_service_now];
        servicetime = 0;
        customer_type = 0;
        servers.end_time[who_service_now] += servicetime;
      };
    }

    //將舊時間變數套用上本次修改的時間
    servers.end_time[who_service_now] = start_time_temp + servicetime
    min_end_time = start_time_temp + servicetime;
    open_time += servicetime;

    //轉換時間單位
    var dur = open_time - tmp_time;
    var arrivalhour = parseInt(arrival_time / 3600);
    var arrivalmin = parseInt(arrival_time / 60 % 60);
    if (arrivalmin < 10) {
      arrivalmin = arrivalmin.toString();
      arrivalmin = "0" + arrivalmin;
    }
    var arrivalsec = parseInt(arrival_time % 60);
    if (arrivalsec < 10) {
      arrivalsec = arrivalsec.toString();
      arrivalsec = "0" + arrivalsec;
    }
    var starthour = parseInt(start_time / 3600);
    var startmin = parseInt(start_time / 60 % 60);
    if (startmin < 10) {
      startmin = startmin.toString();
      startmin = "0" + startmin;
    }
    var startsec = parseInt(start_time % 60);
    if (startsec < 10) {
      startsec = startsec.toString();
      startsec = "0" + startsec;
    }
    if (customer_type == 0) {
      var endhour = parseInt(arrival_time / 3600);
      var endmin = parseInt(arrival_time / 60 % 60);
      if (endmin < 10) {
        endmin = endmin.toString();
        endmin = "0" + endmin;
      }
      var endsec = parseInt(arrival_time % 60);
      if (endsec < 10) {
        endsec = endsec.toString();
        endsec = "0" + endsec;
      }
    } else {
      var endhour = parseInt(servers.end_time[who_service_now] / 3600);
      var endmin = parseInt(servers.end_time[who_service_now] / 60 % 60);
      if (endmin < 10) {
        endmin = endmin.toString();
        endmin = "0" + endmin;
      }
      var endsec = parseInt(servers.end_time[who_service_now] % 60);
      if (endsec < 10) {
        endsec = endsec.toString();
        endsec = "0" + endsec;
      }
    }

    //將本次顧客資料放入物件陣列
    customer_data.id.push(i);
    customer_data.arrival_time.push(arrival_time);
    customer_data.start_time.push(start_time);
    if (customer_type == 0) {
      customer_data.end_time.push(arrival_time);
    } else {
      customer_data.end_time.push(servers.end_time[who_service_now]);
    }
    customer_data.inq.push(0);
    customer_data.ins.push(0);
    customer_data.out.push(0);
    customer_data.type.push(customer_type)
    var in_queue_str = "";
    var max_id = 0;
    for (var j = 0; j < i; j++) {
      if (customer_data.arrival_time[i - 1] >= customer_data.start_time[j] && customer_data.arrival_time[i - 1] <= customer_data.end_time[j]) {
        if (customer_data.id[j] > max_id) {
          max_id = customer_data.id[j];
        }
        if (in_queue_str == "") {
          in_queue_str += customer_data.id[j].toString();
        } else {
          in_queue_str += ' , ' + customer_data.id[j].toString();;
        }
      }
    }
    queue = customer_data.id[i - 1] - max_id;
    if (customer_type) {
      str += "<tr><td>" + i + "</td><td> Drink " + customer_type + "</td><td>" + arrivalhour + ":" + arrivalmin + ":" + arrivalsec + "</td><td>" + starthour + ":" + startmin + ":" + startsec + "</td><td>" + endhour + ":" + endmin + ":" + endsec + "</td><td>" + dur + " sec</td><td>" + servers.name[who_service_now] + "</td></tr>";
    } else {
      str += "<tr><td>" + i + "</td><td>" + "Leave" + "</td><td>" + arrivalhour + ":" + arrivalmin + ":" + arrivalsec + "</td><td>" + "#######" + "</td><td>" + "#######" + "</td><td>" + dur + " sec</td><td>" + "NaN" + "</td></tr>";
    }
  }
  str += "</table>";
  document.getElementById("output").innerHTML = str;

  //動畫
  // 加入服務生
  // console.log(servers.name.length)
  svg.selectAll("img")
    .data(servers.name)
    .enter()
    .append("image")
    .attr("class", "simElement")
    .attr("xlink:href", "waiter.png")
    .attr('x', (d, i) => width / 2 + i * 50 - 50)
    .attr('y', (d) => 20)
    .attr("width", 50)
    .attr("height", 50)

  simulate_id++;
  var tmp_simulate_id = simulate_id;
  var count = 0;

  // setInterval重複跑function
  var tID = setInterval(myFunc01, speed);
  var time_str = "";

  // clearInterval: stop simulate
  var stop = document.querySelector('.stop');
  stop.addEventListener('click', () => {
    clearInterval(tID)
    d3.selectAll(".simElement").transition();
  }, false);
  // console.log(customer_data)
  var sim_cus = 0
  var customers_div = svg
    .selectAll("g")
    .data(customer_data.id)
    .enter()
    .append("g")
    .attr("id", (d) => "cus_" + d)

  function myFunc01() {
    document.getElementById("simulate").innerHTML = time_str;
    var now_time = open_time2 + count;
    // console.log("now",now_time)
    var now_time_hour = parseInt(now_time / 3600);
    var now_time_min = parseInt(now_time / 60 % 60);
    var now_time_sec = parseInt(now_time % 60);
    time_str = now_time_hour + ":" + now_time_min + ':' + now_time_sec;
    count++;
    var temp_count = open_time2 + count;
    if (parseInt(customer_data.arrival_time[sim_cus]) < temp_count) {
      arrive = customer_data.arrival_time[sim_cus]
      start_service = customer_data.start_time[sim_cus]
      end_service = customer_data.end_time[sim_cus]

      var queue_duration = start_service - arrive
      var service_duration = end_service - start_service

      // console.log(queue_duration, service_duration)
      var customer_png = Math.random() < 0.5 ? "human.png" : "woman.png";
      let cust = d3.select("#cus_" + (parseInt(sim_cus) + 1))
        .append("svg:image")
        .attr("class", "simElement")
        .attr("xlink:href", customer_png)
        .attr("width", 50).attr("height", 50)
        .attr("x", 0)
        .attr("y", 50)

      var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
      var randPosition = plusOrMinus * Math.random()
      // console.log(sim_cus, customer_data.type[sim_cus])
      cust.transition()
        .duration(1000)
        .ease(d3.easeExpOut)
        .attr("x", 150)
        .attr("y", 150 + randPosition * 100)
        .on("end", serviceSim(sim_cus))

      function serviceSim(sim_cus) {
        if (customer_data.type[sim_cus] != 0) {
          if (sim_cus == 0) {
            cust.transition()
              .delay(queue_duration * speed)
              .duration(service_duration * speed)
              .ease(d3.easeCircleInOut)
              .attr("x", (width - 500) / 2 + 500)
              .attr("y", 150)
              .on("end", leaveSim)
          } else {
            cust.transition()
              .delay(queue_duration * speed + 1000)
              .duration(service_duration * speed)
              .ease(d3.easeCircleInOut)
              .attr("x", (width - 500) / 2 + 500)
              .attr("y", 150)
              .on("end", leaveSim)
          }
        } else {
          cust.transition()
            .delay(1000)
            .duration(1000)
            .ease(d3.easeExpIn)
            .attr("x", -50)
            .attr("y", height)
        }
      }

      function leaveSim() {
        cust.transition()
          .duration(1000)
          .ease(d3.easeExpIn)
          .attr("x", width)
          .attr("y", 150)
      }
      sim_cus++
    }

    for (var i = 0; i < run; i++) {
      if (parseInt(customer_data.arrival_time[i]) < temp_count && customer_data.inq[i] == 0) {
        customer_data.inq[i] = 1;
      }
      if (parseInt(customer_data.start_time[i]) < temp_count && customer_data.ins[i] == 0) {
        customer_data.ins[i] = 1;
      }
      if (parseInt(customer_data.end_time[i]) < temp_count && customer_data.out[i] == 0) {
        customer_data.out[i] = 1;
      }
    }
    if (count >= (customer_data.end_time[run - 1] - open_time2) || tmp_simulate_id != simulate_id) {
      clearInterval(tID);
    }
  }

  //統計
  var buy_I = 0;
  var buy_II = 0;
  var leave = 0;
  customer_data.type.forEach(element => {
    if (element == 1) {
      buy_I++;
    } else if (element == 2) {
      buy_II++;
    } else {
      leave++;
    }
  });
  document.getElementById("buy_I").innerHTML = 'Bought Drink I ：' + buy_I + '  customers';
  document.getElementById("buy_II").innerHTML = 'Bought Drink II：' + buy_II + ' customers';
  document.getElementById("leave").innerHTML = 'Left：' + leave + ' customers';
  var first_arrival_time = 0
  var last_arrival_time = 0;
  var total_wait_time = 0;
  var total_service_time = 0;
  for (var i = 0; i < run; i++) {
    if (i == 0) {
      first_arrival_time = customer_data.arrival_time[i];
    }
    if (i == (run - 1)) {
      last_arrival_time = customer_data.arrival_time[i];
    }
    total_wait_time += customer_data.start_time[i] - customer_data.arrival_time[i];
    total_service_time += customer_data.end_time[i] - customer_data.start_time[i]
  }

  var all_time = last_arrival_time - first_arrival_time;
  var service_per_m = all_time / run / 60;
  var avg_service_s = total_service_time / run;
  var avg_wait_s = total_wait_time / run;
  document.getElementById("service_per_m").innerHTML = service_per_m.toFixed(2) + '  customer come per minute';
  document.getElementById("avg_service_s").innerHTML = 'Average Service Time：' + avg_service_s.toFixed(2) + ' seconds'
  document.getElementById("avg_wait_s").innerHTML = 'Average Waiting Time：' + avg_wait_s.toFixed(2) + ' seconds'
  document.getElementById("stat").innerHTML = 'Results of Simulation';
  document.getElementById("stats").style.opacity = "1";
}

//指數分布
function randomExponential(rate, randomUniform) {
  rate = rate || 1;
  var U = randomUniform;
  if (typeof randomUniform === 'function') U = randomUniform();
  if (!U) U = Math.random();
  return -Math.log(U) / rate;
}

//清除上一次模擬的紀錄
function clear_count() {
  q_count = 0;
  s_count = 0;
  o_count = 0;
  svg.selectAll(".simElement").remove();
}

//Purchase Probability恆等於100
d3.select(".SRR")
  .on("change", function(params) {
    document.getElementById("SR2R").value = 100 - this.value;
  })
d3.select(".SR2R")
  .on("change", function(params) {
    document.getElementById("SRR").value = 100 - this.value;
  })
