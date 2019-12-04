"use strict";
if (!window.WebSocket) {
  document.body.innerHTML = "WebSocket в этом браузере не поддерживается.";
}

$(function () {
  const form = $(".msg-report");
  const user = $(".user");
  const username = user.data('login');
  const room = user.find('.chat').data('chat-id');
  // const socket = new WebSocket(`ws://${document.location.hostname}:5432`); // or ws://localhost:8081

  // // socket
  // socket.onclose = function (ev) {
  //   if (ev.wasClean) {
  //     console.log('Соединение закрыто чисто');
  //   } else {
  //     console.log('Обрыв соединения');
  //   }
  //   console.log('Код: ' + ev.code + ' причина: ' + ev.reason);
  // }

  // socket.onmessage = function (ev) {
  //   const data = JSON.parse(ev.data);
  //   console.log(data)
  //   const msgs = user.find('.messages');
  //   const anotherUser = username !== data.username;
  //   const msgBlock = `<div
  //   data-id="${data.id}"
  //   class="message ${anotherUser ? 'message--diffColor' : ''}">
  //   <span>${data.username}:</span> ${data.msg}</div>`;

  //   msgs.append(msgBlock);
  //   // if (success) push data + message date/time
  //   form.find('[name="msg"]').val('');
  // }

  // socket.onerror = function (err) {
  //   console.log('err', err)
  // }

  function pushMessage(msg) {
    // socket.send(JSON.stringify({ msg, username, id: user.attr('id') }));
    const recipient = user.find('button').data('recipient-id');

    $.ajax({
      url: '/chat/sendMsg',
      type: 'POST',
      contentType: "application/json",
      data: JSON.stringify({ msg, recipient, room }),
      success: function () {
    //     const msgs = user.find('.messages');
    //     const msgBlock = `<div
    // data-id="${user.id}" class="message">
    // <span>${username}:</span> ${msg}</div>`;

    //     msgs.append(msgBlock);
        form.find('[name="msg"]').val('');
        location.reload(true);
      },
      error: function (err) {
        console.log(err)
      }
    });
  }

  function resetForms(form, reset) {
    form.find("input.error, textarea.error, div.error").removeClass("error");
    form.children("p.error, p.success").remove();

    if (reset) {
      form.find("input.error, textarea.error").val("");
      form.find("div.error").html("");
    }
  }

  function validateForm(data) {
    const form = this.tagName == "FORM" ? $(this) : $(this).closest("form");
    form.children("p").remove();

    if (!data.ok) {
      if (data.error) {
        const fTitle = form.find("h2");

        if (fTitle.length) {
          fTitle.after('<p class="error">' + data.error + "</p>");
        } else {
          form
            .children()
            .eq(0)
            .before('<p class="error">' + data.error + "</p>");
        }
      }

      if (data.fields) {
        data.fields.forEach(function (item) {
          form.find("#" + item).addClass("error");
        });
      }
    } else {
      resetForms(form);
    }
    return data.ok;
  }

  $(".js-reg, .js-auth").click(function (e) {
    e.preventDefault();
    $(".auth form").slideToggle(500);
    resetForms($(".auth form"));
  });

  // clear
  $("input").on("focus", function () {
    resetForms($(this).closest("form"), false);
  });

  $(".form-group").on("click", function () {
    resetForms($(this).closest("form"), false);
  });

  // register
  $(".js-confirm-reg").on("click", function (e) {
    e.preventDefault();

    var el = this;
    var data = {
      login: $("#reg-login").val(),
      password: $("#reg-pass").val(),
      passwordConfirm: $("#reg-pass-confirm").val()
    };

    $.ajax({
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      url: "/ajax/register"
    }).done(function (data) {
      const success = validateForm.call(el, data);

      if (success) {
        $(location).attr("href", `/chat/${data.userId}`);
      }
    });
  });

  // authorization
  $(".js-confirm-auth").on("click", function (e) {
    e.preventDefault();

    var el = this;
    var data = {
      login: $("#auth-login").val(),
      password: $("#auth-pass").val()
    };

    $.ajax({
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      url: "/ajax/login"
    }).done(function (data) {
      const success = validateForm.call(el, data);

      if (success) {
        $(location).attr("href", `/chat/${data.userId}`);
      }
    });
  });

  $(".auth form input").on("keydown", function (e) {
    if (e.key == "Enter") {
      $(this)
        .closest("form")
        .find(".btns button:last-child")
        .trigger("click");
      e.preventDefault();
    }
  });

  // chat
  $('form[name=sendMsg').submit(function (e) {
    e.preventDefault();
    const newMsg = $(this).find('input[name=msg]').val();

    if (newMsg) {
      pushMessage(newMsg);
    }
  });
});