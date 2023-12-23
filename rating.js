$(document).ready(function () {
    var rating_data = 0;

    $('#add_review').click(() => $('#review_modal').modal('show'));

    $(document).on('mouseenter', '.submit_star', function () {
        const rating = $(this).data('rating');
        $('.submit_star').removeClass('text-warning').slice(0, rating).addClass('text-warning');
    });

    function resetStars() {
        $('.submit_star').addClass('star-light').removeClass('text-warning');
    }

    $(document).on('mouseleave', '.submit_star', resetStars);

    $(document).on('click', '.submit_star', function () {
        rating_data = $(this).data('rating');
        updateMessage();
    });

    $('#save_review').click(function () {
        const user_name = $('#user_name').val();
        const user_review = $('#user_review').val();

        if (!rating_data) showMessage('Please choose a Rating.');
        else if (!user_name) showMessage('Please enter name.');
        else if (!user_review) showMessage('Please write your review.');
        else {
            $.post("rating.php", { rating_data, user_name, user_review, user_ip })
                .done(function (data) {
                    $('#review_modal').modal('hide');
                    loadRatingData();
                    alert(data);
                })
                .fail(() => showMessage('An error occurred during submission.'));
        }
    });

    function showMessage(message) {
        $('#message').text(message);
    }

    function updateMessage() {
        const user_name = $('#user_name').val();
        const user_review = $('#user_review').val();

        showMessage(rating_data === 0 ? 'Please choose a Rating.' : '');
    }

    $('#user_name, #user_review').on('input', function () {
        if ($(this).val() !== '') showMessage('');
    });

    loadRatingData();

    function loadRatingData() {
        $.post("rating.php", { action: 'load_data' }, function (data) {
            const { average_rating, total_review, review_data } = data;

            $('#average_rating').text(average_rating);
            $('#total_review').text(total_review);

            $('.main_star').each(function (index) {
                $(this).addClass((Math.ceil(average_rating) >= index + 1) ? 'text-warning star-light' : '');
            });

            ['five', 'four', 'three', 'two', 'one'].forEach(function (rating) {
                $('#' + rating + '_star_review').text(data[rating + '_star_review']);
                $('#' + rating + '_star_progress').css('width', (data[rating + '_star_review'] / total_review) * 100 + '%');
            });

            if (review_data.length > 0) {
                review_data.reverse();

                const html = review_data.map((review) => `
                    <div class="review-card">
                        <div>
                            <div class="">
                                <div class="card-header">
                                    <div id="rh">
                                        <img class="dp" src="http://localhost:8080/rate/res/img/${review.user_dp}"/>
                                        <div id="rh2"><b>${review.user_name}</b></div>
                                        <span class="usrra">
                                            ${Array.from({ length: 5 }, (_, star) =>
                                                <i class="fa fa-star ${review.rating >= star + 1 ? 'text-warning' : 'star-light'} mr-1"></i>
                                            ).join('')}
                                        </span>
                                    </div>
                                </div>
                                <div class="card-body">${review.user_review}</div>
                                <div class="card-footer text-right rvt"> ${review.datetime}</div>
                            </div>
                        </div>
                    </div>`).join('');

                $('#review_content').html(html);
            }
        }, 'json');
    }
});
