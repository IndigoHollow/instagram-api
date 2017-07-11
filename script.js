const 	token = '691623.1419b97.479e4603aff24de596b1bf18891729f3',
		user_url = 'https://api.instagram.com/v1/users/691623/media/recent',
		total = 20;

function loadPosts(total, container) {
	$.ajax({
		url: user_url,
		dataType: 'jsonp',
		type: 'GET',
		cache: false,
		data: {access_token: token, count: total},
		success: function(result) {
			  for( x in result.data ){
				const data = result.data[x];
			    
				let location_name = '',
					creation_time = '',
					caption_text = '',
					media_type = '',
					carousel = false,
					day_type = 'week';

				//Проверка свойств на наличие значения
				if(data.location) {
					location_name = data.location.name;
				}
				if(data.caption) {
					creation_time = data.caption.created_time;
					caption_text = data.caption.text;
				}

				//Проверка типа поста: изображение, видео или карусель
				if(data.type == "image") {
					media_type = '<img src="'+data.images.low_resolution.url+'">';
				} else if(data.type == "video") {
					media_type = '<video controls><source src="'+data.videos.low_resolution.url+'" type="video/mp4"/></video>';
				} else if(data.type == "carousel") {
					media_type = '<ul class="sliders">';
					for(var i=0; i<data.carousel_media.length; i++) {
						media_type += '<li class="slider"><img src="'+data.carousel_media[i].images.low_resolution.url+'"></li>';
					}
					media_type += '</ul><div class="toolbar"><div id="j-backward"></div><div id="j-forward"></div></div>';
					carousel = true;
				}
				
				//Преобразование даты из unix формата
				function timeConverter(unix_timestamp, date_type){
					const non_unix_date = new Date(unix_timestamp * 1000),
						  time = new Date(),
						  mils_in_week = 604800000,
						  mils_in_day = 86400000;
						  
					let   post_ago = '';
					
					if(date_type == 'weeks') {
						post_ago = Math.round((time-non_unix_date)/mils_in_week);
					} else if(date_type == 'days') {
						post_ago = Math.round((time-non_unix_date)/mils_in_day);
					}
					
					return post_ago;
				}
				
				//Получение количества недель, прошедших с даты
				let weeks_ago = timeConverter(creation_time, 'weeks');
				
				if(!weeks_ago) {
					weeks_ago = timeConverter(creation_time, 'days');
					day_type = "day";
				}

				//Функция добавления очередного поста на страницу
				function generatePost(username, avatar_url, post_url, post_id, likes_amount, container) {
					const profile_url = '<a href="https://www.instagram.com/'+data.user.username+'/">',
						  //Блоки с содержимым очередного поста
						  block = '<li class="item"></li>',
						  
						  insta_top = '<div class="insta-top">'+profile_url+'<div class="insta-avatar"><img src="'+avatar_url+'" border=0></div></a><div class="insta-top-right"><div class="insta-username">'+profile_url+username+'</a></div><div class="insta-location">'+location_name+'</div></div><div class="insta-postdate"><a href="'+post_url+'">'+(weeks_ago + (day_type == "week" ? (weeks_ago > 1 ? ' weeks ago' : ' week ago') : (weeks_ago > 1 ? ' days ago' : ' day ago')))+'</a></div></div>',
						  
						  insta_image = '<div class="insta-image">'+media_type+'</div>',
						  
						  insta_bottom = '<div class="insta-bottom"><div class="insta-heart" data-id="'+post_id+'"></div><div class="insta-likes">'+likes_amount+'</div><div class="insta-text">'+caption_text+'</div></div>';

					//Сборка очередного блока с постом
					$(block).appendTo(container);
					$(insta_top).appendTo('.item:last-child');
					$(insta_image).appendTo('.item:last-child');
					$(insta_bottom).appendTo('.item:last-child');
				}
				
				generatePost(data.user.username, data.user.profile_picture, data.link, data.id, data.likes.count, '.wrapper');
				
				//Если есть хотя бы один пост с каруселью, запускаем функцию слайдера
				if(carousel) {
					goSlider();
				}
			  }
			  
				//Деление сгенерированных постов на колонки
				$.fn.masonry = function(params){
					const defaults = {
					  columns: 3
					};

					let options = $.extend(defaults, params),
						container = this,
						items = container.find('.item'),
						colCount = 0,
						columns = $(Array(options.columns + 1).join('<div></div>')).addClass('masonryColumn').appendTo(container);
						
					for(let i = 0; i < items.length; i++){
						items.eq(i).appendTo(columns.eq(colCount));
						colCount = (colCount + 1 > (options.columns - 1)) ? 0 : colCount + 1;
					}
				}

				$(function(){
					$('.wrapper').masonry({
						columns: 3
					});
				});
				
				//Вывод идентификатора записи при клике по значку сердца
				$('div.insta-heart').click(function() {
					alert($(this).attr('data-id'));
				});
		},
		error: function(result){
			console.log(result);
		}
	});
}

function goSlider(){

	const sliders = $('.sliders > .slider');
	let curIndex = 0;

	//Показ другого изображения в слайдере
	function gotoIndex(index){
		sliders.eq(curIndex).removeClass('showing');
		curIndex = (index+sliders.length)%sliders.length;
		sliders.eq(curIndex).addClass('showing');
	}

	function pre(){
		gotoIndex(curIndex-1);
	}

	function next(){
		gotoIndex(curIndex+1);    
	}

	$('#j-backward').click(function(){
		pre();
	});

	$('#j-forward').click(function(){
		next();
	});

	gotoIndex(0);
}

loadPosts(total, '.wrapper');