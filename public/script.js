$( document ).ready(function() {

  var statusFailedCount = 0;
  var enableAlert = false;
  var playingAlert = false;
  var showingPriceList = false;
  var checkPoint = ''
  var audio;

  loadCards();
  setInterval(function() {
    loadCards();
  }, 2000);

  function loadCards() {
    $.ajax({
      url: '/poll?checkPoint=' + checkPoint,
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      success: function(data, textStatus, request) {
        let forceUpdate = checkPoint != data.checkPoint
        checkPoint = data.checkPoint
        if (data.highlightCards.length > 0) {
          // Play alert
          if (!playingAlert && enableAlert) {
            playingAlert = true

            audio = new Audio('/alert.mp3')
            audio.addEventListener('ended', function() {
              playingAlert = false
            })
            audio.play().catch (function(err) {
              playingAlert = false
              alert(err)
            })
          }

          // Show price list
          // if (!showingPriceList) {
          //   showingPriceList = true
          //   $('#storeCards').addClass('d-none')
          //   $('#priceList').removeClass('d-none')
          // }

        }

        if (data.highlightCards.length > 0 || forceUpdate) {
          let cardsHtml = ''
          for (let highlightCard of data.highlightCards) {
            cardsHtml += processCardHtml(highlightCard)
          }
          $("#highlightCard").html(cardsHtml)
        }

        if (data.storeCards.length > 0 || forceUpdate) {
          let cardsHtml = ''
          for (let storeCard of data.storeCards) {
            cardsHtml += processCardHtml(storeCard)
          }
          $("#storeCards").html(cardsHtml)
        }

        if (data.sellerCards.length > 0 || forceUpdate) {
          let cardsHtml = ''
          for (let sellerCard of data.sellerCards) {
            cardsHtml += processCardHtml(sellerCard)
          }
          $("#sellerCards").html(cardsHtml)
        }

        let lastReceived = new Date(data.lastReceived)

        if (Math.abs(new Date() - lastReceived) > 120000) {
          $('#navBar').css('background-color', '#f8d7da')
          $('#navText').html(`Stopped. Last received: ${lastReceived.toLocaleString()}`)
        } else {
          $('#navBar').css('background-color', '#c3e6cb')
          $('#navText').html(`Last received: ${lastReceived.toLocaleString()}`)
        }

        if (data.notification) {
          $('#notifyIcon').addClass('fa-bell').removeClass('fa-bell-slash')
          $('#notifyBtn').addClass('btn-success').removeClass('btn-danger')
        } else {
          $('#notifyIcon').addClass('fa-bell-slash').removeClass('fa-bell')
          $('#notifyBtn').addClass('btn-danger').removeClass('btn-success')
        }

        statusFailedCount = 0;
      },
      error: function(xhr, status, errMsg){
        statusFailedCount ++;
        if (statusFailedCount >= 5) {
          $('#navBar').css('background-color', '#f8d7da')
          $('#navText').html(`Failed to poll. Last received: ${lastReceived.toLocaleString()}`)
        }
      }
    });
  }

  $("#alertBtn").click(function(){
    enableAlert = !enableAlert
    if (enableAlert) {
      $('#alertBtn').addClass('btn-success').removeClass('btn-danger')
    } else {
      $('#alertBtn').addClass('btn-danger').removeClass('btn-success')
      if (audio != undefined) {
        audio.pause()
        audio.currentTime = 0
        playingAlert = false
      }
    }
  });

  $("#notifyBtn").click(function(){
    $.ajax({
      url: '/toggleNotification',
      type: 'GET',
      success: function(data, textStatus, request) {},
      error: function(xhr, status, errMsg){}
    });
  });

  $("#priceListBtn").click(function(){
    showingPriceList = !showingPriceList
    if (showingPriceList) {
      $('#otherCards').addClass('d-none')
      $('#priceList').removeClass('d-none')
    } else {
      $('#otherCards').removeClass('d-none')
      $('#priceList').addClass('d-none')
    }
  });

  $("#clearBtn").click(function(){
    $.ajax({
      url: '/clear',
      type: 'GET',
      success: function(data, textStatus, request) {
        $("#storeCards").html('')
        $("#highlightCard").html('')
        $("#sellerCards").html('')
      },
      error: function(xhr, status, errMsg){}
    });
  });

  $("#testBtn").click(function(){
    $.ajax({
      url: '/test',
      type: 'GET',
      success: function(data, textStatus, request) {},
      error: function(xhr, status, errMsg){}
    });
  });

  function processCardHtml(card) {
    let col = `
      <div class="card mt-2">
        <div class="row no-gutters">
          <div class="col-auto">
            <img class="border-right" src="cardUrl" width="130" height="130">
          </div>
          <div class="col">
            <div class="card-block px-2">
              <p class="card-text mb-1"><b>cardItem</b></p>
              <div class="row">
                <div class="col">
                  <p class="lead mb-1"><big>cardModel</big></p>
                  <p class="card-text mb-1"><span class="lead mr-2"><b>$ cardPrice</b></span> cardStore </p>
                </div>
                <div class="col">
                  <a target="_blank" href="cardItemUrl" class="btn btn-primary mt-4 pull-right ml-2">Buy</a>
                  <a target="_blank" href="cardAtcUrl" class="btn btn-primary mt-4 pull-right cardAtcClass">Add to cart</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    let title = card.item
    if (card.model.startsWith('30')) {
      title = title.replace(/(2\.0)/gm, '<span class="bg-warning">$1</span>').replace(/(3\.0)/gm, '<span class="bg-warning">$1</span>')
      .replace(/(lhr)/gmi, '<span class="bg-warning">$1</span>').replace(/(-KL)/gmi, '<span class="bg-warning">$1</span>')
      .replace(/(v2)/gmi, '<span class="bg-warning">$1</span>').replace(/(v3)/gmi, '<span class="bg-warning">$1</span>')
    }

    col = col.replace('cardPrice', card.price).replace('cardStore', capitalize(card.store))
      .replace('cardItem', title).replace('cardModel', card.model).replace('cardItemUrl', card.url)
    
    if (card.thumbnail == undefined) {
      col = col.replace('cardUrl', 'https://spng.pngfind.com/pngs/s/90-902842_ball-yarn-stitch-markers-available-hd-png-download.png')
    } else {
      col = col.replace('cardUrl', card.thumbnail)
    }  

    if (card.hasOwnProperty('atc') && card.atc != '') {
      col = col.replace('cardAtcClass', '').replace('cardAtcUrl', card.atc)
    } else {
      col = col.replace('cardAtcClass', 'd-none')
    }


    return col
  }

  function capitalize(s) {
    if (s == undefined) return undefined
    return s[0].toUpperCase() + s.slice(1)
  }

});