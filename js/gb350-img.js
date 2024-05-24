/*===========================================================*/
/*機能編  5-1-14 クリックしたらナビが右から左に出現*/
/*===========================================================*/

$(".openbtn").click(function () {//ボタンがクリックされたら
	$(this).toggleClass('active');//ボタン自身に activeクラスを付与し
    $("#g-nav").toggleClass('panelactive');//ナビゲーションにpanelactiveクラスを付与
});

$("#g-nav a").click(function () {//ナビゲーションのリンクがクリックされたら
    $(".openbtn").removeClass('active');//ボタンの activeクラスを除去し
    $("#g-nav").removeClass('panelactive');//ナビゲーションのpanelactiveクラスも除去
});


/*===========================================================*/
/*機能編  8-1-7 スクロール途中からリンクボタンの形状が変化*/
/*===========================================================*/
//スクロールした際の動きを関数でまとめる
function PageTopCheck(){
    var winScrollTop = $(this).scrollTop();
    var secondTop =  $("#sort").offset().top - 150; //#sortの上から150pxの位置まで来たら
    if(winScrollTop >= secondTop){
		$('.js-scroll').removeClass('scroll-view');//.js-scrollからscroll-viewというクラス名を除去
		$('.js-pagetop').addClass('scroll-view');//.js-pagetopにscroll-viewというクラス名を付与
	} else {//元に戻ったら
		$('.js-scroll').addClass('scroll-view');//.js-scrollからscroll-viewというクラス名を付与
		$('.js-pagetop').removeClass('scroll-view');//.js-pagetopからscroll-viewというクラス名を除去
	}

}

//クリックした際の動き
$('.scroll-top a').click(function () {
	var elmHash = $(this).attr('href'); //hrefの内容を取得
	if (elmHash == "#gallery") {//もし、リンク先のhref の後が#galleryの場合
		var pos = $(elmHash).offset().top;
		$('body,html').animate({scrollTop: pos}, pos); //#galleryにスクロール
	}else{
		$('body,html').animate({scrollTop: 0}, 500); //それ以外はトップへスクロール。数字が大きくなるほどゆっくりスクロール
	}
    return false;//リンク自体の無効化
});

 /*===========================================================*/
/*機能編  6-1-4 動きを組み合わせて全画面で見せる*/
/*===========================================================*/
    
//画像と動画の設定
var windowwidth = window.innerWidth || document.documentElement.clientWidth || 0;
		if (windowwidth > 768){
			var responsiveImage = [//PC用の動画と画像
				{ src: './img/main01.jpg',//動画が再生されなかった場合の代替画像
                 video:{
                     src: [//mp4で動画が再生されない時のことを考えて複数の形式の動画を設定
                         './video/movie.mp4',
                         './video/movie.webm',
                         './video/movie.ogv'
                     ],
                     loop: false,//動画を繰り返さない
                     mute: true,//動画の音を鳴らさない
                 }
				},
				{src: './img/main02.jpg'},
				{src: './img/main03.jpg'}
			];
		} else {
            var responsiveImage = [//タブレットサイズ（768px）以下用の画像
				{ src: './img/main_sp01.jpg' },
				{ src: './img/main_sp02.jpg' },
				{ src: './img/main_sp03.jpg' }
			];
}

//Vegas全体の設定
$('#slider').vegas({
		overlay: true,//画像の上に網線やドットのオーバーレイパターン画像を指定。
		transition: 'fade2',//切り替わりのアニメーション。http://vegas.jaysalvat.com/documentation/transitions/参照。fade、fade2、slideLeft、slideLeft2、slideRight、slideRight2、slideUp、slideUp2、slideDown、slideDown2、zoomIn、zoomIn2、zoomOut、zoomOut2、swirlLeft、swirlLeft2、swirlRight、swirlRight2、burnburn2、blurblur2、flash、flash2が設定可能。
		transitionDuration: 2000,//切り替わりのアニメーション時間をミリ秒単位で設定
		delay: 5000,//スライド間の遅延をミリ秒単位で。
		animationDuration: 20000,//スライドアニメーション時間をミリ秒単位で設定
		animation: 'random',//スライドアニメーションの種類。http://vegas.jaysalvat.com/documentation/transitions/参照。kenburns、kenburnsUp、kenburnsDown、kenburnsRight、kenburnsLeft、kenburnsUpLeft、kenburnsUpRight、kenburnsDownLeft、kenburnsDownRight、randomが設定可能。
		slides: responsiveImage,//画像と動画の設定を読む
	});


/*===========================================================*/
/*機能編  6-2-2 カテゴリ別に画像を並び替える*/
/*===========================================================*/
//＝＝＝ Fancyboxの設定
$('[data-fancybox]').fancybox({
 thumbs: {
    autoStart: false, //グループのサムネイル一覧をデフォルトで出す。不必要であればfalseに
  },	
});
関数 delayScrollAnime ( )  {
	var 時間 =  0.2 ; // 遅延時間を増やす秒数を指定する
	var 値 = 時間;
	$ ( '.delayScroll' ) . each (関数 ( )  {
		var 親 =  this ; 					//親要素を取得する
		var  elemPos  =  $ ( this ) 。オフセット（）。上; //要素の位置まで
		var  scroll  =  $ (ウィンドウ) 。スクロールトップ( ) ; //スクロール値を取得する
		var  windowHeight  =  $ ( window ) 。身長（）; // 画面を表示する
		var  childs  =  $ ( this ) 。子供たち（）; 	//子要素

		if  ( scroll  >=  elemPos  -  windowHeight  &&  ! $ ( parent ) . hasClass ( "play" ) )  { //指定領域内にスクロールが入ったらまた親要素にクラスplayがなければ
			$ (子) . each (関数 ( )  {

				if  ( ! $ ( this ) . hasClass ( "fadeUp" ) )  { // アニメーションのクラス名を購入しているかどうかをチェック

					$ (親) 。クラスを追加します( "play" ) ; 	//親要素にクラス名playを追加
					$ (これ) 。css ( "animation-delay" 、 値 +  "s" ) ; // アニメーション遅延のCSS animation-delayを追加し
					$ (これ) 。addClass ( "フェードアップ" ) ; // アニメーションのクラス名を追加
					値 = 値 + 時間; //遅延時間を増加させる

					//全ての処理を終えたらplayを外す
					var  index  =  $ ( childs ) .index ( this ) ;​
					if ( ( childs.length - 1 ) == index ) {​​  
						$ (親) .removeClass ( " play" ) ;
					}
				}
			} ）
		}それ以外 {
			$ (子) 。removeClass ( "フェードアップ" ) ; // アニメーションのクラス名を削除
			値 = 時間; //delay初期値の数値を返す
		}
	} ）
}
//========================================================
// 関数をまとめる
//========================================================

// ページが読み込まれたらすぐに動かしたい場合の記述
$(window).on('load',function(){	
   
/*===========================================================*/
/*機能編  6-2-2 カテゴリ別に画像を並び替える*/
/*===========================================================*/
//画面遷移時にギャラリーの画像が被らないように、すべての読み込みが終わった後に実行する 
//＝＝＝Muuriギャラリープラグイン設定
    var grid = new Muuri('.grid', {

//アイテムの表示速度※オプション。入れなくても動作します
showDuration: 600,
showEasing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
hideDuration: 600,
hideEasing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
	
// アイテムの表示/非表示状態のスタイル※オプション。入れなくても動作します
  visibleStyles: {
    opacity: '1',
    transform: 'scale(1)'
  },
  hiddenStyles: {
    opacity: '0',
    transform: 'scale(0.5)'
  }    
});
    
//＝＝＝並び替えボタン設定
$('.sort-btn li').on('click',function(){			//並び替えボタンをクリックしたら
	$(".sort-btn .active").removeClass("active");	//並び替えボタンに付与されているactiveクラスを全て取り除き
	var className = $(this).attr("class");			//クラス名を取得
	className = className.split(' ');				//「sortXX active」のクラス名を分割して配列にする
	$("."+className[0]).addClass("active");			//並び替えボタンに付与されているクラス名とギャラリー内のリストのクラス名が同じボタンにactiveクラスを付与
	if(className[0] == "sort00"){						//クラス名がsort00（全て）のボタンの場合は、
        grid.show('');								//全ての要素を出す
        setTimeout(function(){//ここからは選択後にふわっと出すアニメーションを使用したい場合の追記
            delayScrollAnime();
        },1000);//ここまで
	}else{											//それ以外の場合は
		grid.filter("."+className[0]); 				//フィルターを実行
		setTimeout(function(){//ここからは選択後にふわっと出すアニメーションを使用したい場合の追記
            delayScrollAnime();
        },1000);//ここまで
	}
});

/*===========================================================*/
/* 印象編 8-1 テキストがバラバラに出現 */
/*===========================================================*/

/*===========================================================*/
/*機能編  4-1-1数字カウントアップ*/
/*===========================================================*/


