$(document).ready(function () {
    $('#user').dropdown({});
    $('.ui.modal').modal('show')
    $(".rating").rating();
});

function addEventsToLocalstorage() {

    var originalSetItem = window.localStorage.setItem;

    window.localStorage.setItem = function () {
        originalSetItem.apply(this, arguments);

        var event = new Event('storageItemChanged');
        document.dispatchEvent(event);
    }

}

addEventsToLocalstorage();