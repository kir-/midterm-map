$(() => {
  $('.login-form').on('submit', (event) => {
    event.preventDefault();
    const username = $('#username').val();
    const password = $('#password').val();
    $.post('/login', {username, password}).done((response) => {
      if (response === 'authorized') {
        const content = `
        <span class="nav-item mb-1 active">
          <a class="display-username h3" >${username}</a>
        </span>
        `;
        $('.login-form').html(content);
        $('.login-form').children('button').toggleClass('d-none')
        $('.log-out').toggleClass('d-none')

      }
    });
  });

  $('.log-out').on('click', () => {
    $('.login-form').html(`
      <input class="form-control mr-sm-2" name='username' id='username' type="test" placeholder="Username">
      <input class="form-control mr-sm-2" name='password' id='password'type="password" placeholder="Password">
      <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Login</button>
    `);
    $('.log-out').toggleClass('d-none')
    $("div[aria-labelledby='favorite']").html(`<a class="dropdown-item" href="#">Favorites</a><div class="dropdown-divider"></div>
         `);
    $("div[aria-labelledby='Contribution']").html(`
    <a class="dropdown-item" href="#">Contributions</a>
            <div class="dropdown-divider"></div>
    `)
  });

});
