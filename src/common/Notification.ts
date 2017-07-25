export const Notifications = {

    Practise: (link: string) => {

        if ("Notification" in window) {

            let permission = Notification.permission;

            if (permission === "denied") {
                return;
            } else if (permission === "granted") {
                return goToPractise();
            }

            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    goToPractise();
                }
            });
        }

        function goToPractise() {

            link = link || null; // Link is optional
            let duration = 10000; // Default duration is 5 seconds

            var options = {
                body: 'Es ist Zeit zum Üben',
                icon: 'https://avatars1.githubusercontent.com/u/28737602?v=4&s=200'
            };

            var n = new Notification('Braintrainer', options);

            if (link) {
                n.onclick = function () {
                    window.open(link);
                };
            }

            setTimeout(n.close.bind(n), duration);
        }


    }

};