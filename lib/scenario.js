/**
 * Created by HDA3014 on 14/03/2016.
 */
    if (typeof runtimeRegister !='undefined') {
        var order = 0;
        var facts = [];
        var sending = false;
        var svg = SVG(runtimeRegister(
            function (fact) {
                function send(sendIt) {
                    if (sendIt) {
                        var fact = facts.shift();
                        if (fact) {
                            sending = true;
                            svg.request("/log", fact)
                                .onSuccess(function () {
                                    send(true);
                                })
                                .onFailure(function () {
                                    throw "Server Error";
                                });
                        } else {
                            sending = false;
                        }
                    }
                }

                fact.order = order++;
                facts.push(fact);
                send(!sending);
            }
        ));
    }