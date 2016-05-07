/*
 * Echizen City Garbage and Recycling Collection Calendar.
 *
 * Copyright 2015 8am.
 * http://8am.jp/
 *
 * 福井県越前市の次のゴミ収集日を表示するカレンダーです。
 */

$(function() {
    var caption = "Echizen City Garbage and Recycling Collection Calendar.";
    var parent    = "http://8am.jp/%E8%B6%8A%E5%89%8D%E5%B8%82%E3%81%94%E3%81%BF%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/";
    var data = {};
    var storagekey = "apps.gcc-echizen-city.address";
    var $dashboard = $("#dashboard");
    var $selectbox = $("<select/>").addClass("form-control").attr("id", "selectbox");
    var $tile = $("<div><div/><div/><div/></div>").addClass("tile");
    $tile.find("div").eq(0).addClass("title");
    $tile.find("div").eq(1).addClass("date");
    $tile.find("div").eq(2).addClass("days");

    init();

    $(window).on("load orientationchange", function(event) {
        layout();
    });

    $selectbox.change(function() {
        showCalendar();
        try {
            localStorage.setItem(storagekey, $(this).val());
        } catch(e) {
        }
    });

    function layout() {
        var width = $dashboard.width();
        var height = $(window).height();
        var s = (height > width) ? width / 3 : width / 4;
        $(".tile").width(s * 0.98).height(s * 0.98).css("margin-left", s * 0.02 + "px").css("margin-bottom", s * 0.02 + "px");
        $(".title").css("font-size", s * 0.11 + "px");
        $(".date").css("font-size",    s * 0.33 + "px");
        $(".days").css("font-size",    s * 0.08 + "px");
        $(".next").width(s * 2 * 0.99).height(s * 2 * 0.99).css("margin-left", s * 2 * 0.01 + "px").css("margin-bottom", 0);
        $(".next .title").css("font-size", s * 0.11 * 2 + "px");
        $(".next .date").css("font-size",    s * 0.33 * 2 + "px");
        $(".next .days").css("font-size",    s * 0.08 * 2 + "px");
        $("#caption").css("font-size", s * 0.125 + "px");
 };

    function getAddress() {
        var n = location.search.replace(/[\?](\d+)/, "$1");
        if (!location.search || isNaN(n)) n = localStorage.getItem(storagekey);
        if (n == null || isNaN(n)) n = 209;
        try {
            localStorage.setItem(storagekey, n);
        } catch(e) {
        }
        return Number(n);
    }

    function showCalendar() {
        $dashboard.empty();

        var n = $selectbox.val();
        var item = data[n].dates;
        item.sort(function(a, b) {
            return (a.date < b.date) ? -1 : 1;
        });

        $.each( item, function() {
            var d = new Date(this.date);
            var e = $tile.clone();
            e.attr("id", this.id);
            e.find(".title").text(this.title);
            if (d.toString() !== "Invalid Date") {
                e.find(".date").text( [d.getMonth() + 1, d.getDate()].join("/") );
                e.find(".days").text( Math.ceil( ( d.getTime() - new Date().getTime() ) / ( 1000 * 60 * 60 * 24 ) ) + " days / " + data[n][this.id]);
            } else {
                e.find(".date").text("-");
            }
            $dashboard.append(e);
        });

        $dashboard.append(
            $("<div/>")
                .attr("id", "caption").addClass("tile")
                .append($("<p/>").text(caption))
                .append($("<p/>").attr("id", "credit")
                    .append($("<a/>")
                        .attr("href", parent)
                        .attr("target", "_parent")
                        .text("このアプリについて")
                    )
                )
        );

        $(".tile:first-child").addClass("next");
        layout();
    }

    function getData() {
        var deferred = new $.Deferred;
        $.ajax(
            "./json.php",
            {
                dataType: "jsonp",
                jsonpCallback: "gomisyusyubi"
            }
        )
        .done(function( json ) {
            data = json;
            deferred.resolve();
        });
        return deferred.promise();
    }

    function showSelectBox() {
        var $option = $("<option/>");
        $.each( data, function(i, item) {
            var e = $option.clone();
            e.attr("value", i)
            e.text(item.address);
            $selectbox.append(e);
        });
        $("#header").append($selectbox);
        $selectbox.val( getAddress() );
    }

    function init() {
        getData()
        .done(function() {
            showSelectBox();
            showCalendar();
        });
    }
});