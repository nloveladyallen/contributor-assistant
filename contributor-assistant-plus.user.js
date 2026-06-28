// ==UserScript==
// @name         Contributor Assistant+
// @namespace    http://tampermonkey.net/
// @version      2026-06-27g
// @description  Marks contributors on stock sites as American or foreign, and adds country filters to Pond5 and Envato.
// @author       You
// @match        https://*.shutterstock.com/video/*
// @match        https://*.shutterstock.com/image-photo/*
// @match        https://*.shutterstock.com/image-vector/*
// @match        https://*.pond5.com/stock-footage/item/*
// @match        https://*.pond5.com/stock-images/photos/item/*
// @match        https://stock.adobe.com/video/*
// @match        https://stock.adobe.com/images/*
// @match        https://elements.envato.com/*
// @exclude      https://elements.envato.com
// @match        https://www.storyblocks.com/video/stock/*
// @match        https://artgrid.io/clip/*
// @match        https://artlist.io/stock-footage/clip/*
// @match        https://dissolve.com/video/*
// @match        https://dissolve.com/stock-photo/*
// @match        https://www.istockphoto.com/video/*
// @match        https://www.istockphoto.com/photo/*
// @match        https://www.pond5.com/search?*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        window.onurlchange
// ==/UserScript==

// Some clients insist on only using stock photos and footage from American contributors. This script exists to help find that, which stock sites do not always make obvious.

// This is actually the selector for the parent of the element containing the contributor name.
const CONTRIBUTOR_SELECTOR_SHUTTERSTOCK = 'div > div > div > div > div > span > p';
const CONTRIBUTOR_SELECTOR_POND5 = '#main > div > div.u-size1of1 > div.ItemDetailV4-itemInfoWrapper.u-bgCodGray.u-colorWhite.has-organicBlueBar.js-itemDetailInfoWrapper > div > div > div > div.ItemDetailV4-itemInfoGrid > div.ItemDetailV4-itemInfoGridHeadingColumn.dsm.ItemDetailV4-itemInfoGridHeadingColumn--video.js-awCustomClick > div.ItemDetailV4-artistAndUsage > a > span.u-text14px.u-linkWhite';
const CONTRIBUTOR_SELECTOR_ADOBE_STOCK = '#details > div > div > div.row-flex-detailspanel > div.padding-actionpanel > div > div > div > div > div.details-margin-bottom > div';
const CONTRIBUTOR_SELECTOR_ENVATO = '#content > div > div > div.ES35fwD6.jA4sXDPG.SHv85Oe2.NlCr4004.uedkJzta > div.ES35fwD6.SHv85Oe2.NlCr4004.uedkJzta > div > div > div > div > div > div.ES35fwD6.l38mXzx2 > div > div._l9nSumF > div > div > div.QejAgNG_.rGep5HSU > div.QejAgNG_.GaPUhC0N > span';
const CONTRIBUTOR_SELECTOR_STORYBLOCKS = '#details-app-container > div > div > div.stockItemDetails-row > div.flex.flex-column.text-white > div.relative.flex.flex-col.flex-1.mx-4.justify-center.text-white > div.stockItemInfo-stockSpecContributor > span.stockItemInfo-stockSpecItemValue'
const CONTRIBUTOR_SELECTOR_ARTGRID = 'body > art-root > div > mat-sidenav-container:nth-child(3) > mat-sidenav-content > art-clip-page > div.art-clip-container > div.art-clip-container--content.ng-star-inserted > art-clip-details > div > div.art-film-maker-name > div.name-details'
const CONTRIBUTOR_SELECTOR_ARTLIST = 'div[data-testid=ClipInfo] div';
const CONTRIBUTOR_SELECTOR_DISSOLVE = '#license > div > div.medium-8.columns.video_hero__column.video_hero__asset_container > div > div > div.columns.product_details__video > div > div > div > div.medium-6.large-4.columns.product_details__column';
const CONTRIBUTOR_SELECTOR_ISTOCK = 'body > div.content_wrapper > section > div > main > div > div > div > div > div > section.meta.Rfm5Ib9MsxDzwZ1PfoKh > section > div.adp-contributor > a';

const DEFAULT_AMERICAN = [
    'jakerbreaker',
    'Kali9',
    'Kindel Media',
    'Matt Gush',
    'JoshFan',
    'Olga Belyaevskaya',
    'Burlingham',
    'LPETTET',
    'Jesperson Productions',
    'Vesperstock',
    'Design Projects',
    'Rubberball',
    'ODesigns',
    'Nicholas Courtney',
    'Samwagnerphotography',
    'Zenstrata',
    'Kristi Blokhin',
    'Steve Byland',
    'Hangtime Media',
    'HangtimeMedia',
    'Henry Harrison',
    'Pronghorn Productions',
    'Ethan Daniels',
    'T_RoFilms',
    'Richard Seeley',
    'CrackerClips',
    'Scenelabpro',
    'Rekindle Photo and Video',
    'Chriarascura',
    'Via Films',
    'ViaFilms',
    'Uberstock',
    'MakanaCreative',
    'Makana Creative',
    'gustavisonfilms',
    'Spencer Platt',
    'dapoopta',
    'pixelabstudios',
    'JumpCut',
    'Timelapse City',
    'observe-productions',
    'Andriy Stefanyshyn',
    'Gian Lorenzo Photography',
    'Tadinski13',
    'Sky Rock Media',
    'Francisco Blanco',
    'Colorapt Media',
    'StockElements',
    'Moab Republic',
    'TrueAutonomy',
    'plez',
    'millerpowell',
    'ShaFilms',
    'Scott Cornell',
    'cbertucio',
    'nimio',
    'THCLIPS',
    'blendimages',
    'JamesBrey',
    'James Brey',
    'WeatherNews',
    'Stock Footage Inc',
    'stockfootageinc',
    'Beach Media',
    'RichLegg',
    'RickRay',
    'Rocketclips',
    'Made360',
    'Dean Drobot',
    'Drobot Dean',
    'JHDT Productions',
    'Doug Jones',
    'squashhousemedia',
    'EasyStreet',
    'Brocreative',
    'Eliyahu Yosef Parypa',
    'Joseph Sohm',
    'Willee Cole',
    'EpicStockMedia',
    'Sharkshock',
    'stock_photo_world',
    'blvdone',
    'Becky Sheridan',
    'Elnariz',
    'El Nariz',
    'Erickson Stock',
    'jgroup',
    'Dan Thornberg',
    'DanThornberg',
    'Openrangestock',
    'James.Pintar',
    'W. Scott McGill',
    'Glynnis Jones',
    'Eric Urquhart',
    'Wangkun Jia',
    'Nikolai Sorokin',
    'aceshot',
    'Hank Shiffman',
    'Gino Santa Maria',
    'Baiterek Media',
    'lev radin',
    'Harry HU',
    'R. Gino Santa Maria',
    'Gino Santa Maria',
    'Alexey Rotanov',
    'iofoto',
    'Karramba Production',
    'Valerio Pucci',
    'Carlos Yudica',
    'Janet J',
    'drbimages',
    'Ed Bock',
    'Edward J Bock',
    'Mitch Boeck',
    'Tracy Whiteside',
    'Everett Collection',
    'Susan Law Cain',
    'Melissa Hanes',
    'Orlowski Designs LLC',
    'Dominik Skorynko',
    'Hyperlapse Media',
    'canvan-images',
    'Jadimages',
    'Lane Erickson',
    'Lane V. Erickson',
    'Evgenia Parajanian',
    'Di Studio',
    'BCFC',
    'Mega Pixel',
    'David S Swierczek',
    'Joseph Sohm',
    'BILD LLC',
    'Songquan Deng',
    'melissamn',
    'Trongnguyen',
    'Trong nguyen',
    'magicoven',
    'Topseller',
    'Mikeledray',
    'Randall Vermillion',
    'Nagel Photography',
    'pabrady63',
    'Paul brady',
    'Juli Hansen',
    'Fotoluminate LLC',
    'Johnrob',
    'Andrew Cline',
    'BestStockFoto',
    'A katz',
    'Evan El-Amin',
    'Rena Schild',
    'John Gress Media',
    'MKPhoto12',
    'Joseph Sohm',
    'Steve Cukrov',
    'Dave Newman',
    'Ken Wolter',
    'Johnny Silvercloud',
    'W.Scott McGill',
    'Heyengel',
    'Engel ching',
    'Zack Frank',
    'Rena Schild',
    'MeganBetteridge',
    'Rob Byron',
    'zimmytws',
    'jeremyculpdesign',
    'Artazum',
    'Nd700',
    'rCarner',
    'jasonwilsonstudio',
    'Chiarascura',
    'Rick Ray',
    'alphaglobal',
    'Proper Films',
    'Nicholas J Klein',
    'Nicholas J. Klein',
    'Hundley Photography',
    'Jeff McCollough',
    'photovs',
    'EarthBean',
    'andersenross',
    'Aleatoric',
    'funnerprod',
    'AndriyPhotography',
    'Pro_Studio',
    'Pro-Studio',
    'AndriyASD',
    'forrestbro',
    'Michael F. Hiatt',
    'KingsCountyProductions',
    'StrangeTheaterLLC',
    'shaneyork',
    'TheRadarLab',
    'logoboom',
    'J.D.S',
    'jdoms',
    'Sundry Photography',
    'Felipe Sanchez',
    'TonyTheTigersSon',
    'Michael Flippo',
    'slocummedia',
    'Terri Cage',
    'BrooksRangeMedia',
    'SDCphoto',
    'Globescope',
    'Jaime Byrd',
    'Pretty Colors',
    'Joshua Pedersen',
    'Sftigress',
    'Kit Leong',
    'kitleong',
    'manueladurson',
    'jiawangkun',
    'FiveCornersfilm',
    'AlteredR',
    'tiberio',
    'mark29',
    'cavort',
    'peternsj',
    'garyorona',
    'KalininStudios',
    'Mizamook',
    'felixmizioznikov',
    'handelh',
    'CascadeCreatives',
    'NatureWV',
    'AylorDraw',
    'Aerial_Shots',
    'guillaumelynn',
    'Sam Wagner',
    'Oleggg',
    'Pathos Media',
    'Arina P Habich',
    'mphillips007',
    'funnelbox',
    'Cavan',
    'TheStacks',
    'StockAttack2020',
    'avgeeks',
    'Wirestock Creators',
    'Justin Horrocks',
    'Joseph Kelly',
    'CraftedShutter',
    'Elan Irving',
    'IronStrike',
    'jn14productions',
    'Matthew Bartolacci',
    'ungvar',
    'SouthCityCamera',
    'DogPhonics',
    'JeffKohler',
    'FILMPAC',
    'janetti',
    'Milk_Image_a_Films',
    'Edgarfreytesmomentos',
    'GoodSportVideo',
    'pathosmedia',
    'mooveen',
    'MediaFuzeBox',
    'pagetfilms',
    'Barbara J. Johnson',
    'Stockpot',
    'LLstock',
    'Neil Lockhart',
    'Jaynelle Summerville',
    'Rebekah Zemansky',
    'Karin Hildebrand Lau',
    'Peter Kaiser',
    'Tetra Motion',
    'Olya Lytvyn',
    'Andersen Ross Production',
    'Simone Hogan',
    'Availablelight',
    'Brianspix',
    'D\'Action Images',
    'A Matter Of Will',
    'Parker Walbeck',
    'Silver Lake Studios',
    'TetraImages',
    'adamkaz',
    'Colleen Michaels',
    'Susan Montgomery',
    'Mark Allen Robinson',
    'David Jolly',
    'Volodymyr TVERDOKHLIB',
    'Artbeats',
    'Topiary Productions',
    'uzhursky',
    'ESMAndrewR',
    'lemonjuice',
    'bonandbon',
    'powson',
    'Andriy Blokhin',
    'Core-Visual',
    'John Neff',
    'Denise Andersen',
    'Dendrometer',
    'denispac',
    'Pamela Au',
    'Newport Coast Media',
    'SchulteProductions',
    'kongfhac649',
    'lawcain',
    'Chiarascuro',
    'MadMac',
    'TheSceneLab',
    'shrubber',
    'lovemushroom'
]; // end DEFAULT_AMERICAN
const DEFAULT_FOREIGN = [
    'Monkeybusiness',
    'Monkey Business',
    'Ross Hillier',
    'Motortion',
    'Vnik',
    'Dabarti',
    'PD_Media',
    'Stockmarketfilms',
    'CactusVP',
    'Saracin',
    'Dualstock',
    'A Visual World',
    'Madeleine Deaton',
    'Savanterpro',
    'Juan Carlos Munoz',
    'Azari',
    'SeventyFour',
    'Natalia Deriabina',
    'Hananeko_Studio',
    'KinoMaster',
    'Stockbusters',
    'Aerocaminua',
    'Konstantin Shishkin',
    'DeRepente',
    'Cinematic Vision',
    'skywardkick',
    'Skyward Kick',
    'Skyward_Kick',
    'dotshock',
    'Brad Day',
    'Omnis',
    'M-Stock Agency',
    'danr13',
    'Szekeres Szabolcs',
    'ALFA',
    'lkunl',
    'hotelfoxtrot',
    'SJ Travel',
    'Danil Rudenko',
    'Atomazul',
    'Airstock',
    'jrmyyz1961',
    'orbitrob',
    'fivamedia',
    'DCStudio',
    'Artemegorov',
    'Artem Egorov',
    'Targosz',
    'AlexeyPlatonov',
    'Alexey Platonov',
    'Alexey_Platonov',
    'Pressmaster',
    'WeAre',
    'Eldelik',
    'kagemusha',
    'Spotmatik',
    'ReeldealHD',
    'ronstik',
    'guteksk7',
    'Benjamas Pech',
    'Zakharchuk',
    'Ground Picture',
    'nednapa',
    'CK Foto',
    'Archmotion',
    'nevio',
    'rsooll',
    'STILLFX',
    'Castleski',
    'Branex',
    'Marc Xavier',
    'razihusin',
    'deagreez',
    'Robert Kneschke',
    'Phawat',
    'Corgarashu',
    'Africa Studio',
    'denizbayram',
    'Eric Isselee',
    'fewerton',
    'Podarenka',
    'Ivan Kuzmin',
    'Africa Studio',
    'ILYA AKINSHIN',
    'zhu difeng',
    'AYAimages',
    'gui yong nian',
    'Dmitriy',
    'htpix',
    'HT-Pix',
    'Bhakpong',
    'Terng99',
    'Casa imágenes',
    'Rawpixel',
    'Antonio Guillem',
    'Lopolo',
    'wavebreakmedia',
    'NakoPhotography',
    'ASDF',
    'Olena Yakobchuk',
    'Pavel L Photo and Video',
    'Ievgenii Meyer',
    'djile',
    'Auremar',
    'Phovoir',
    'Dmitry_Evs',
    'Worawuth',
    'Andrew Bayda',
    'Rawf8',
    'Jess Kraft',
    'Mike Mareen',
    'Spiroview Inc.',
    'Lee Barnwell',
    'L Barnwell',
    'trongnguyen',
    'Trong nguyen',
    'Drimafilm',
    'Mikkel Bigandt',
    'nskyr2',
    'Alotofpeople',
    'aijiro',
    'luengo_ua',
    'SIMPILI',
    'Stokkete',
    'Nomad_Soul',
    'Tyler Olson',
    'Lipatova Maryna',
    'Alexandru Logel',
    'Peshkova',
    'B-D-S Piotr Marcinski',
    'tiero',
    'Axel Bueckert',
    'Asier Romero',
    'kudla',
    'Antoniodiaz',
    'ESB Professional',
    'BBC 2020',
    'stockyimages',
    'Kalyanby',
    'Hallojulie',
    'Michelaubryphoto',
    'Spyarm',
    'Tyunikov',
    'beatrice prève',
    'Diego Grandi',
    'MevZup',
    'Famed01',
    'Anaglic',
    'biletskiyevgeniy.com',
    'Whitecityrecords',
    'Yü Lan',
    'Bertys30',
    'Kai Krueger',
    'Gresei',
    'Rawf8',
    'Feiyuezhangjie',
    'Krakenimages.com',
    'leungchopan',
    'Alexandre zveiger',
    'Filip Warulik',
    'Hugo Felix',
    'PixieMe',
    'Rui vale sousa',
    'AJP',
    'Top Photo Engineer',
    'ImageFlow',
    'mimagephotography',
    'Ranta Images',
    'Trendsetter Images',
    'Antonio Gravante',
    'Simon Greig',
    'tulpahn',
    'David Ryo',
    'BublikHaus',
    'ArtFamily',
    'spaxiax',
    'fantom_rd',
    'Ysbrand Cosijn',
    'YsbrandCosijn',
    'Zoran Zeremski',
    'tung',
    'Tungphoto',
    'Oleksandr Dibrova',
    'ArtisticPhoto',
    'Y.Yamkaew',
    'Neirfy',
    'Homo Cosmicos',
    'vesta48',
    'valeriyap',
    'Rezona',
    'Vaalaa',
    'Viacheslav Lopatin',
    'Margo1778',
    'nyiragongo',
    'Paisan191',
    'Asianet-Pakistan',
    'Rudi1976',
    'Rudy Balasko',
    'WONG SZE FEI',
    'Szefei',
    'Shawn Hempel',
    'Kaspars Grinvalds',
    'LouiesWorld1',
    'Aila Images',
    'aslysun',
    'Chris Bourloton',
    'pixelfit',
    'Maridav',
    'Csaba Deli',
    'Piotr Marcinski',
    'Dmytro Zinkevych',
    'Johnstocker Production',
    'Voyagerix',
    'Cat Box',
    'gpointstudio',
    'Andrej Hicil',
    'dkovalenko',
    'Gelpi',
    'michaeljung',
    'MarijaKerekes',
    'gcafotografia',
    'Liza888',
    'Minerva Studio',
    'GeorgeRudy',
    'IKO-studio',
    'A.D.S.Portrait',
    'Lapina',
    'Ridofranz',
    'Daxiao Productions',
    'My Ocean Studio',
    'My Ocean Production',
    'mimagephotos',
    'Roman Samborskyi',
    'Koldunov',
    'Sinnlichtarts',
    'Sorapop',
    'Serrnovik',
    'Sergey Novikov',
    'Oksana Kuzmina',
    'Svetography',
    'altanaka',
    'Photographee.eu',
    'HTeam',
    'jackf',
    'BearPhotos',
    'Marzolino',
    'Galitskaya',
    'godshutter',
    '2xsamara.com',
    'Sunny studio',
    'Konstantin Yuganov',
    'Yuganov Konstantin',
    'Konstantin Iuganov',
    'Best smile studio',
    'Satura_',
    'Shyamalamuralinath',
    'patrikslezak',
    'Plo',
    'ink drop',
    'InkheartX',
    'Giannis Papanikos',
    'jakeowenpowell',
    'Asmus Koefoed',
    'Nick Bakhur',
    'ESB Professional',
    'rangizzz',
    'Liderina',
    'Negro Elkha',
    'bogdanvija',
    'Bogdan vija',
    'Nito',
    'Fredex',
    'Gustavofrazao',
    'Vitalii Vodolazskyi',
    'qingwa',
    'speedshutter Photography',
    'Stockr',
    'STILLFX',
    'Tim UR',
    'Ronald Sumners',
    'Valentyn Volkov',
    'Boule',
    'Maks Narodenko',
    'Nitr',
    'Viiviien',
    'Pixfly',
    'vadim_ozz',
    'DUSAN ZIDAR',
    'George Dolgikh',
    'Billion Photos',
    'Dexireimage',
    'ABCDstock',
    'Demkat',
    'Melnikov Sergey',
    'Sergey Skleznev',
    'Marques',
    'Watercolor_Art_Photo',
    'Jenifoto',
    'Sergey Peterman',
    'Sara Winter',
    'Mario.lizaola',
    'Ivan Danik',
    'paulista',
    'engagestock',
    'FamVeld',
    'LightFieldStudios',
    'LightField Studios',
    'spass',
    'Wayhome',
    'danielschoenen',
    'Vladdeep',
    'Kekyalyaynen',
    'oneinchpunch',
    'mediaphotos',
    'courtyardpix',
    'Rick Partington',
    'Dragon Images',
    'Svyatoslav Lypynskyy',
    'Sergii Mostovyi',
    'Mostovyi Sergii Igorevich',
    'Jacoblund',
    'Jacob Lund',
    'Ajrimages',
    'Ajr_images',
    'Ajr_photo',
    'SilviaJansen',
    'Dipak Shelare',
    'Ermolaev Alexandr',
    'dundanim',
    'Agenturfotografin',
    'Cookie Studio',
    'izusek',
    'Ryan Rodrick Beiler',
    'Frederic Legrand',
    'Ververidis Vasilis',
    'LP2Studio',
    'trahko',
    'Henryk Sadura',
    'D.aniel',
    'Hunter Bliss Images',
    'Tupungato',
    'Alberto Zamorano',
    'Smit',
    'Andriano_cz',
    'andriano.cz',
    'Iaroslav Neliubov',
    'Cherries',
    'Polthanawat',
    'fornStudio',
    'Nuttapong punna',
    'Nik Merkulov',
    'Valeri Luzina',
    'temp-64GTX',
    'Antonio ciero',
    'Halfpoint',
    'Michaeljung',
    'Piman Khrutmuang',
    'PhotoAleks',
    'Catshila',
    'Catinsyrup',
    'ArtBackground',
    'Allies Interactive',
    'Donatas1205',
    'Sergiophoto', // end alex contributors
    'methaphum',
    'punyawee22',
    'ArliftAtoz2205',
    'rrudenkois',
    'tridland',
    'olegbadak',
    'FabrikaPhoto',
    'YuriArcursPeopleimages',
    'clickmymedia',
    'ayeshafernando',
    'azhorov',
    'madWTF',
    'demopicture',
    'New Africa',
    'livefireexclusive',
    'Atstock Productions',
    'Atstock_Productions',
    'luxorphoto',
    'Gorodenkoff',
    'fergregory',
    'Fer Gregory',
    'Krzysztof Bubel',
    'Paul Vinten',
    'Rido81',
    'valeriygoncharukphoto',
    'StiahailoAnastasiia',
    'SynthEx',
    'Morsa Images',
    'Sean Anthony Eddy',
    'Johanna Goodyear',
    'Dragon Images',
    'dragonimages',
    'H_Ko',
    'Gendar Sinuro',
    'BravissimoS',
    '月 明',
    'fred goldstein',
    'Brebca',
    'towfiqu98',
    'Mint_Images',
    'kamui29',
    'hiv360',
    'jantsarik',
    'bergjakob',
    'ruwanof',
    'FabrikaSimf',
    'vital9c',
    'skarie20',
    'AmazingAerialAgency',
    'Amazing Aerial Agency',
    'allenum',
    'FunKeyFactory',
    'FunKeyRec',
    'okanakdeniz_new',
    'LENSLOGIC',
    'DS-Studio-N',
    'AnnaStills',
    'DedovStock',
    'FrameStock',
    'Frame Stock Footage',
    'Klymentii',
    'SibFilm',
    'market_animation',
    'Patramansky',
    'Lelia_Milaya',
    'yoydesign',
    'yoycg',
    'vkasporsky',
    'seregam',
    'Hugh Adams',
    'janews',
    'FatCamera',
    'sasha2109',
    'Evgeniy Goncharov photo',
    'Evgeny_Gonchar',
    'okanakdeniz',
    'Eleven52',
    'Stockagent_io',
    'MarinaDemidiuk',
    'localradio',
    'HighWay_videography',
    'artemkorchagin',
    'TakeFiveProduction',
    'tripwire_stock',
    'catolla',
    'vik2010',
    'luzitanija',
    'strokevorkz',
    'L_V_V_',
    'mizina',
    'fizkes',
    'KonstantinYuganov',
    'VadimGuzhva',
    'EFEKT_Studio',
    'breejeanjohnson',
    'CESM_Studio',
    'garloon',
    'vladimircaribb',
    'FiledIMAGE',
    'adragan',
    'kenishirotie',
    'Nadianb',
    'REDPIXEL',
    'Damir Khabirov',
    'RollingCamera',
    'WallStock',
    'redbred',
    'nimito',
    'Eyesonmilan',
    'saginbay',
    'atwmedia',
    'tishomir',
    'Ukrainian_Media_Archive',
    'paulkell',
    'maxdigi',
    'Studio_Vision',
    'Nik_Waller_Productions',
    'swiss_stock',
    'CleverArts',
    'mclein',
    'PhotonsInAction',
    'AWorldInMotion',
    'Nicoves',
    'cookelma',
    'CinematicStockVideo',
    'paulgrecaud',
    'videodream',
    'addit',
    'pavlas24',
    'Alex_Shi',
    'Subbotina',
    'MagicalMoments',
    'TatianaNurieva',
    'pzaxe',
    'slavik65',
    'KuriloVladimir',
    'nadiya_sergey',
    'alexanderguelph',
    'Livingstills',
    'AndriiOleksiienko',
    'frahealy',
    'ZenStratus',
    'Skyline84',
    'frimufilms',
    'rusm',
    'aflomotion',
    'grthirteen',
    'Coinstock',
    'Vidoiskatel',
    'aircam',
    'MStocker',
    'AlexDrone',
    'Cozine',
    'itp_Stock',
    'ivalukian',
    'yevhentupchii',
    'DamascusStudio',
    'Globetrotter4FR',
    'FrozenAntFilms',
    'padamsphoto',
    'OliverM',
    'CapitanoFootage',
    'videospirale',
    'DogoraSun',
    'davedigitalfx',
    'noahcuni',
    'silverjohn',
    'ramiai',
    'HafBMedia',
    'StockSeller',
    'Andrii_Shramko',
    'Open_Films',
    'Grishayev',
    'mozgova',
    'Jessezhang',
    'StudioASD',
    'MarishaN',
    'kleykov',
    'CalilusBricolage',
    'Easy_Company',
    'Nikitagetto',
    'sedletsky',
    'Makaruk',
    'planarfilm',
    'StockVideoFactory',
    'DariaKozyreva',
    'SVTeam',
    'Strejman',
    'AnyVidStudio',
    'Video_Creative',
    'Sentaline',
    'Westlight',
    'Vitstock',
    'filmsbyben',
    'legan80',
    'Radachynskyi',
    'Freezman',
    'brunot22',
    'Harbinger_Arts',
    'Igorstar',
    'DiamondDallas',
    'ThirdBornEntertainment',
    'crbellette',
    'DallaStock',
    'GlobalNews',
    'Stockshooter',
    'studiostocks',
    'inmicco',
    'recpoint_pro',
    'Daniel Lange',
    'Bernard Chantal',
    'Your files',
    'soniclight',
    'volodymyrkozytskyi232',
    'mstockagency',
    'VUSschneider',
    'waltergeorgian520',
    'redfilm',
    'metamorworks',
    'Jose Luis Carrascosa',
    'vasamil',
    'ismail378',
    'AilaImages',
    'silverkblack',
    'chmiel',
    'Zdan_Ivan',
    'mooseman',
    'multifocus',
    'icsnaps',
    'arabianeye',
    'dolgachov',
    'LukasPich',
    'martinharvey',
    'HeroImages',
    'Wavebreak_video',
    'happycamel',
    'StratfordProductions',
    'mrTommy',
    'FractalPictures',
    'tomross49',
    'SunPhotography',
    'alenlomstock634',
    'america_stock',
    'travelexdi',
    'akekrat',
    'chfonk',
    'Tirachard',
    'supamotion',
    'realism',
    'motion_poland',
    'webclipmaker',
    'BreakingTheWalls',
    'MrOverdrive',
    'ondrejprosicky',
    'Maneerat',
    'ditesta',
    'Julia1989',
    'bazilfoto',
    'ProCinemaStock',
    'Iaroslav',
    'Shannon__Wild',
    'warrengoldswain',
    'BoBoPhoto',
    'magicmore',
    'BuzzerBeaters',
    'LuAleks',
    'viktorsvetlov',
    'Igor_TT',
    'One_vision',
    'berdiy888',
    'aluxum',
    'Viorel Sima',
    'Serhii',
    'PolonioVideo',
    'Towfiqu ahamed barbhuiya',
    'G.Tbov',
    'Chay_Tee',
    'Maskot Images',
    'KrakenImages',
    'StockXL',
    'pikselstock',
    'SuziMediaProduction',
    'PeopleImages.com',
    'Red_haired_video',
    'komamur',
    'GoldenEarring',
    'berdiyandriy',
    'polly_belyaeva',
    'Jacob Wackerhausen',
    'marianstock',
    'kotlyarn',
    'tampatra',
    'ASerushkov',
    'yanna1985',
    'westend61',
    'DenisNata',
    'Alex_Nick',
    'ElevenStudio',
    'Kopytin Georgy',
    'Jag_cz',
    'MVideos',
    'NAOWARAT',
    'zieusin',
    'LO Kin-hei',
    'giraysait',
    'RawFilms',
    'maradek',
    'DedMityay',
    'Martin Harvey',
    'Anton Watman',
    'stock-enjoy',
    'mettus',
    'Afanasiev Andrii',
    'MADDRAT',
    'SergeyGribanov',
    'Sergey Gribanov',
    'epidemiks',
    'Max Golov',
    'David Kopaleishvili',
    'Lid_Aura',
    'SoftLight',
    'Colzu',
    'ahmet odabasi',
    'asbesto_cemento',
    'WESTOCK PRODUCTIONS',
    'GetMyStock',
    'Ssefat',
    'imtmphoto',
    'iamotos',
    'Roddig',
    'wacomka',
    'Hakan Tanak',
    'stevanovicigor',
    'Dimitar Marinov',
    'oorka',
    'TaraPatta',
    'Andrey Burmakin',
    'Konovalov_video',
    'magnunaStudio',
    'kryvoshapka',
    'wirestock', // AI
    'wasanajai',
    'artiemedvedev',
    'SieSrg',
    'Alexandr Bognat',
    'AlexandrBognat',
    'Mangostar',
    'newrita',
    'jm_video',
    'dream_one',
    'Volodymyr_Malovanyi',
    'siam.pukkato',
    'IvanMel',
    'kostiuchenko',
    'skymediapro',
    'tanaonte',
    'ktt4260',
    'Videostock50',
    'tomgigabite',
    'threejewels',
    'Mineko80',
    'Dmitro2009',
    'TiborMiklos',
    'alt_motion',
    'TanyaJoy',
    'celiafoto',
    'SawBear Photography',
    'EggHeadPhoto',
    'vilma3000',
    'rocketmann production',
    'Rimma Bondarenko',
    'Maskot Images',
    'Navin Ramaswaran',
    'Bowonpat Sakaew',
    'Tupungato',
    'Roob',
    'StockMediaSeller',
    'M_Agency',
    'Gorodenkoff',
    'MAYA LAB',
    'halfpoint',
    'Hero Images Inc'
]; // end DEFAULT_FOREIGN

const STORE_KEY = 'contributorLists';

// Bump this whenever the baked-in defaults change and you want to push the new
// baseline to everyone. On load, a store seeded from an older defaults version
// has its `default` lists replaced with the current defaults. The `user` lists
// are never touched by this, so a user's own additions survive updates.
const DEFAULTS_VERSION = 1;

// The store holds two buckets, each with american/foreign lists:
//   default — seeded from the baked-in lists, re-seeded on a DEFAULTS_VERSION bump
//   user    — the user's own additions, only changed via import/clear, always wins
function emptyLists() {
    return { american: [], foreign: [] };
}

function defaultLists() {
    return { american: DEFAULT_AMERICAN, foreign: DEFAULT_FOREIGN };
}

function freshStore() {
    return { seededVersion: DEFAULTS_VERSION, default: defaultLists(), user: emptyLists() };
}

function validLists(l) {
    return l && Array.isArray(l.american) && Array.isArray(l.foreign);
}

// Loads the contributor lists from Tampermonkey's key-value store, seeding it
// from the baked-in defaults on first run (zero-touch migration), migrating the
// old flat shape, and re-seeding the default bucket when a newer baseline ships.
function loadLists() {
    let stored = GM_getValue(STORE_KEY, null);

    // First run or unusable store: seed defaults with empty user lists.
    if (!stored || typeof stored !== 'object') {
        stored = freshStore();
        GM_setValue(STORE_KEY, stored);
        return stored;
    }

    let changed = false;

    // Migrate the old flat { american, foreign } shape into the default bucket.
    if (Array.isArray(stored.american) && !stored.default) {
        stored = {
            seededVersion: stored.seededVersion ?? stored.version ?? 0,
            default: { american: stored.american, foreign: stored.foreign },
            user: emptyLists()
        };
        changed = true;
    }

    // Repair either bucket if it's missing or malformed.
    if (!validLists(stored.default)) {
        stored.default = defaultLists();
        changed = true;
    }
    if (!validLists(stored.user)) {
        stored.user = emptyLists();
        changed = true;
    }

    // Newer baseline published: replace the default bucket, keep the user bucket.
    if ((stored.seededVersion ?? 0) < DEFAULTS_VERSION) {
        stored.default = defaultLists();
        stored.seededVersion = DEFAULTS_VERSION;
        changed = true;
    }

    if (changed) GM_setValue(STORE_KEY, stored);
    return stored;
}

const lists = loadLists();

// Resolves to the File the user picks. Uses a modal with a real file input so the
// picker opens from a genuine user gesture (menu-command callbacks don't qualify).
function pickJsonFile() {
    return new Promise((resolve, reject) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:2147483647;display:flex;align-items:center;justify-content:center;';

        const box = document.createElement('div');
        box.style.cssText = 'background:#fff;color:#000;padding:24px;border-radius:8px;font:14px sans-serif;text-align:center;max-width:90%;';

        const label = document.createElement('p');
        label.textContent = 'Choose your contributor lists JSON file';
        label.style.cssText = 'margin:0 0 12px';

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        const cancel = document.createElement('button');
        cancel.textContent = 'Cancel';
        cancel.style.cssText = 'display:block;margin:16px auto 0';

        const close = () => overlay.remove();
        input.addEventListener('change', () => {
            const file = input.files[0];
            close();
            file ? resolve(file) : reject(new Error('No file selected'));
        });
        cancel.addEventListener('click', () => { close(); reject(new Error('cancelled')); });
        overlay.addEventListener('click', e => { if (e.target === overlay) { close(); reject(new Error('cancelled')); } });

        box.append(label, input, cancel);
        overlay.append(box);
        document.body.append(overlay);
    });
}

function registerMenuCommands() {
    GM_registerMenuCommand('Export my contributor lists', () => {
        const blob = new Blob([JSON.stringify(lists.user, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'my-contributor-lists.json';
        a.click();
        URL.revokeObjectURL(a.href);
    });

    GM_registerMenuCommand('Import my contributor lists', async () => {
        // Chrome blocks input.click() from a menu-command callback ("lack of user
        // activation"), so show a modal and let the user click the file input
        // directly — that real gesture is what lets the picker open.
        let file;
        try {
            file = await pickJsonFile();
        } catch {
            return; // cancelled
        }
        try {
            const data = JSON.parse(await file.text());
            if (!validLists(data)) {
                throw new Error('Expected { american: [...], foreign: [...] }');
            }
            lists.user = { american: data.american, foreign: data.foreign };
            GM_setValue(STORE_KEY, lists);
            alert('Imported. Reloading.');
            location.reload();
        } catch (e) {
            alert('Import failed: ' + e.message);
        }
    });

    GM_registerMenuCommand('Clear my contributor lists', () => {
        lists.user = emptyLists();
        GM_setValue(STORE_KEY, lists);
        location.reload();
    });

    GM_registerMenuCommand('Reset everything to defaults', () => {
        GM_setValue(STORE_KEY, freshStore());
        location.reload();
    });
}

let filterInfo = {
    filters: ['showAmerican', 'showForeign', 'showUnknown'],
    observer: null
};

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

function appendSpan(parent, content) {
    let span = document.createElement('span');
    span.textContent = content;
    span.classList.add('nla-icon');
    parent.append(span);
}

function clearIcons() {
    let icons = document.querySelectorAll('.nla-icon');
    icons.forEach(icon => icon.remove());
}

// Adds `name` to the user's list for `category` ('american' | 'foreign'),
// removing it from the other user list first so a contributor is never in both.
function setUserClassification(name, category) {
    const other = category === 'american' ? 'foreign' : 'american';
    lists.user[category] = lists.user[category].filter(n => n !== name);
    lists.user[other] = lists.user[other].filter(n => n !== name);
    lists.user[category].push(name);
    GM_setValue(STORE_KEY, lists);
}

function makeIconButton(emoji, title) {
    let span = document.createElement('span');
    span.textContent = emoji;
    span.classList.add('nla-icon');
    span.style.cursor = 'pointer';
    if (title) span.title = title;
    return span;
}

const AMERICAN_EMOJI = ' 🇺🇸';
const FOREIGN_EMOJI = ' 🛑';
const UNKNOWN_EMOJI = ' ❓';
const CHECK_EMOJI = ' ✅';

function getEmoji(status) {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'american') {
        return AMERICAN_EMOJI;
    } else if (lowerStatus === 'foreign') {
        return FOREIGN_EMOJI;
    } else {
        return UNKNOWN_EMOJI;
    }
}

// Renders the status emoji as a clickable control. Clicking it offers a flag /
// stop choice; picking one stores the contributor in the matching user list and
// confirms with a check. `name` is the contributor's display name (used as the
// stored key), so when it's empty we fall back to a plain, non-interactive icon.
function renderClassifier(contributorEl, name, status) {
    if (!name) {
        appendSpan(contributorEl, getEmoji(status));
        return;
    }

    // The icon often lives inside an <a>, so swallow the event to stop the
    // anchor navigating (preventDefault) and any delegated router handler from
    // firing (stopPropagation). Keeps this site-agnostic.
    const swallow = (e, fn) => { e.preventDefault(); e.stopPropagation(); fn(); };

    const emoji = getEmoji(status);
    const current = makeIconButton(emoji, 'Click to classify this contributor');

    current.addEventListener('click', e => swallow(e, () => {
        current.remove();
        const us = makeIconButton(AMERICAN_EMOJI, 'Mark as American');
        const stop = makeIconButton(FOREIGN_EMOJI, 'Mark as foreign');
        const choose = category => {
            setUserClassification(name, category);
            us.remove();
            stop.remove();
            appendSpan(contributorEl, CHECK_EMOJI);
        };
        us.addEventListener('click', e => swallow(e, () => choose('american')));
        stop.addEventListener('click', e => swallow(e, () => choose('foreign')));
        contributorEl.append(us, stop);
    }));

    contributorEl.append(current);
}

async function mainAssistant() {
    const domain = window.location.href.split('/')[2];
    let site = '';
    let selector = '';
    if (domain.includes('shutterstock.com')) {
        site = 'shutterstock';
        selector = CONTRIBUTOR_SELECTOR_SHUTTERSTOCK;
    } else if (domain.includes('pond5.com')) {
        site = 'pond5';
        selector = CONTRIBUTOR_SELECTOR_POND5;
    } else if (domain.includes('stock.adobe.com')) {
        site = 'adobe stock';
        selector = CONTRIBUTOR_SELECTOR_ADOBE_STOCK;
        await new Promise(r => setTimeout(r, 500));
    } else if (domain.includes('elements.envato.com')) {
        site = 'envato';
        selector = CONTRIBUTOR_SELECTOR_ENVATO;
        await new Promise(r => setTimeout(r, 500));
    } else if (domain.includes('storyblocks.com')) {
        site = 'storyblocks';
        selector = CONTRIBUTOR_SELECTOR_STORYBLOCKS;
    } else if (domain.includes('artgrid.io')) {
        site = 'artgrid';
        selector = CONTRIBUTOR_SELECTOR_ARTGRID;
        await new Promise(r => setTimeout(r, 2000)); // artgrid takes forever to load
    } else if (domain.includes('artlist.io')) {
        site = 'artlist';
        selector = CONTRIBUTOR_SELECTOR_ARTLIST;
        await new Promise(r => setTimeout(r, 500));
    } else if (domain.includes('dissolve.com')) {
        site = 'dissolve';
        selector = CONTRIBUTOR_SELECTOR_DISSOLVE;
    } else if (domain.includes('istockphoto.com')) {
        site = 'istock';
        selector = CONTRIBUTOR_SELECTOR_ISTOCK;
        await new Promise(r => setTimeout(r, 500));
    } else {
        console.error('Unsupported domain ' + domain);
        return;
    }

    let contributorEl = document.querySelector(selector);
    let contributor = '';

    if (site === 'dissolve') {
        let candidates = document.querySelectorAll(selector);
        for (const candidate of candidates) {
            let property = candidate.children[0];
            if (property?.innerText === 'Contributor:') {
                contributorEl = candidate.children[1];
                contributor = contributorEl.innerText.trim();
            }
        }
    } else if (site === 'adobe stock') {
        contributor = contributorEl.children[1].textContent.trim();
    } else if (site === 'istock') {
        contributor = contributorEl.children[2].textContent.trim();
    } else {
        contributor = contributorEl.children[0].textContent.trim();
    }

    clearIcons();
    let status = getContributorStatus(contributor);
    renderClassifier(contributorEl, contributor, status);
    GM_addStyle('.nla-icon { margin-left: 10px; }');
}

function createDiv(classNames) {
    let theDiv = document.createElement('div');
    if (typeof classNames === 'string') {
        theDiv.classList.add(classNames);
    } else if (Array.isArray(classNames) || classNames instanceof DOMTokenList) {
        classNames.forEach(className => theDiv.classList.add(className));
    } else {
        console.error("Invalid argument to createDiv");
    }
    return theDiv;
}

function createCheckboxPond5(id, labelText) {
    let container = createDiv('Checkbox');
    let cb = document.createElement('input');
    cb.classList.add('Checkbox-input', 'nla-checkbox');
    cb.type = 'checkbox';
    cb.name = id;
    cb.id = id;
    cb.checked = true;
    let label = document.createElement('label');
    label.classList.add('Checkbox-label');
    label.setAttribute('for', id);
    label.innerText = labelText;
    container.append(cb);
    container.append(label);
    return container;
}

// Styles will break eventually. Oh well
function createCheckboxEnvato(id, labelText) {
    let container = createDiv(['l0z8Gogx', 'akbOyW7N', 'J3nrzrT4', 'JO34GcLR']);
    let cb = document.createElement('input');
    cb.classList.add('wbNGpsJc', 'nla-checkbox');
    cb.type = 'checkbox';
    cb.name = id;
    cb.id = id;
    cb.checked = true;
    let label = document.createElement('label');
    label.classList.add('_7yoIykb4', 'oddFflBz', 'Qu5eWXzk');
    label.setAttribute('for', id);
    label.innerText = labelText;
    container.append(cb);
    container.append(label);
    return container;
}

function statusFromLists(lowerContributor, pair) {
    let status = null;
    pair.american.forEach(usContrib => {
        if (lowerContributor.includes(usContrib.toLowerCase())) {
            status = 'American';
        }
    });
    pair.foreign.forEach(foreignContrib => {
        if (lowerContributor.includes(foreignContrib.toLowerCase())) {
            status = 'foreign';
        }
    });
    return status;
}

function getContributorStatus(contributor) {
    const lowerContributor = contributor.toLowerCase();

    // The user's own lists always win over the defaults.
    return statusFromLists(lowerContributor, lists.user)
        || statusFromLists(lowerContributor, lists.default)
        || 'unknown';
}

function getContributor(result) {
    const domain = window.location.href.split('/')[2];
    if (domain.includes('pond5.com')) {
        return JSON.parse(result.getAttribute('formats_data')).artistname;
    } else if (domain.includes('elements.envato.com')) {
        return result.lastChild.firstChild.innerText;
    } else {
        console.error('Unknown site ' + domain);
    }
}

// resultsSelector is a selector matching each result (NOT the container)
// result.parentElement.parentElement.parentElement should be the container with all results
// filters is an array of the form ['showAmerican', 'showForeign', 'showUnknown']
function filterResults(resultsSelector, filters) {
    filterInfo.filters = filters;

    let results = document.querySelectorAll(resultsSelector);
    let showAmerican = filters.includes('showAmerican');
    let showForeign = filters.includes('showForeign');
    let showUnknown = filters.includes('showUnknown');

    // If all or none checked, we do no filtering
    if ((showAmerican && showForeign && showUnknown) || !(showAmerican || showForeign || showUnknown)) {
        results.forEach(result => result.parentElement.parentElement.classList.remove('nla-hidden'));
        return;
    }
    // At this point, there are results newly excluded

    results.forEach(result => {
        let contributor = getContributor(result);;
        let status = getContributorStatus(contributor);
        let container = result.parentElement.parentElement;
        if (status === 'American') {
            if (showAmerican) {
                container.classList.remove('nla-hidden');
            } else {
                container.classList.add('nla-hidden');
            }
        } else if (status === 'foreign') {
            if (showForeign) {
                container.classList.remove('nla-hidden');
            } else {
                container.classList.add('nla-hidden');
            }
        } else if (status === 'unknown') {
            if (showUnknown) {
                container.classList.remove('nla-hidden');
            } else {
                container.classList.add('nla-hidden');
            }
        } else {
            console.error('Unknown status: ' + status);
        }
    });

    // Some things are newly excluded, so we definitely want to observe the results list
    if (filterInfo.observer) {
        filterInfo.observer.disconnect();
    }
    const debouncedFilter = debounce(filterResults);
    filterInfo.observer = observeResults(resultsSelector, node => debouncedFilter(resultsSelector, filters));
}

function makePond5FilterUI() {
    let filterSection = createDiv('FilterSection');
    let filterSectionContent = createDiv('FilterSection-content');
    let filterSectionContainer = createDiv('FilterSection-container');
    let filterSectionWrapperAmerican = createDiv('FilterSection-wrapper');
    let cbAmerican = createCheckboxPond5('showAmerican', 'Known American');
    filterSectionWrapperAmerican.append(cbAmerican);
    filterSectionContainer.append(filterSectionWrapperAmerican);
    let filterSectionWrapperForeign = createDiv('FilterSection-wrapper');
    let cbForeign = createCheckboxPond5('showForeign', 'Known Foreign');
    filterSectionWrapperForeign.append(cbForeign);
    filterSectionContainer.append(filterSectionWrapperForeign);
    let filterSectionWrapperUnknown = createDiv('FilterSection-wrapper');
    let cbUnknown = createCheckboxPond5('showUnknown', 'Unknown');
    filterSectionWrapperUnknown.append(cbUnknown);
    filterSectionContainer.append(filterSectionWrapperUnknown);
    filterSectionContent.append(filterSectionContainer);
    filterSection.append(filterSectionContent);
    return filterSection;
}

function makeEnvatoFilterUI(container) {
    let exampleFilterSection = container.firstChild;
    let filterSectionClassList = exampleFilterSection.classList;
    let filterSection = createDiv(filterSectionClassList);
    let filterSectionSeparatorClass = exampleFilterSection.firstChild.classList[0];
    let filterSectionSeparator = createDiv(filterSectionSeparatorClass);
    filterSection.append(filterSectionSeparator);
    let filterFieldsetClass = exampleFilterSection.querySelector('fieldset').classList[0];
    let filterFieldset = document.createElement('fieldset');
    filterFieldset.classList.add(filterFieldsetClass);
    let filterLegendClassList = exampleFilterSection.querySelector('legend').classList;
    let filterLegend = document.createElement('legend');
    filterLegend.classList = filterLegendClassList;
    filterLegend.innerText = 'Country';
    filterFieldset.append(filterLegend);
    let filterSectionWrapper1ClassList = exampleFilterSection.querySelector('fieldset > div > div > div').classList;
    let filterSectionWrapper2ClassList = exampleFilterSection.querySelector('fieldset label[data-testid=checkbox-filter-item]').classList;
    let filterSectionWrapper1American = createDiv(filterSectionWrapper1ClassList);
    let filterSectionWrapper2American = createDiv(filterSectionWrapper2ClassList);
    let cbAmerican = createCheckboxEnvato('showAmerican', 'Known American');
    filterSectionWrapper2American.append(cbAmerican);
    filterSectionWrapper1American.append(filterSectionWrapper2American);
    filterFieldset.append(filterSectionWrapper1American);
    let filterSectionWrapper1Foreign = createDiv(filterSectionWrapper1ClassList);
    let filterSectionWrapper2Foreign = createDiv(filterSectionWrapper2ClassList);
    let cbForeign = createCheckboxEnvato('showForeign', 'Known Foreign');
    filterSectionWrapper2Foreign.append(cbForeign);
    filterSectionWrapper1Foreign.append(filterSectionWrapper2Foreign);
    filterFieldset.append(filterSectionWrapper1Foreign);
    let filterSectionWrapper1Unknown = createDiv(filterSectionWrapper1ClassList);
    let filterSectionWrapper2Unknown = createDiv(filterSectionWrapper2ClassList);
    let cbUnknown = createCheckboxEnvato('showUnknown', 'Unknown');
    filterSectionWrapper2Unknown.append(cbUnknown);
    filterSectionWrapper1Unknown.append(filterSectionWrapper2Unknown);
    filterFieldset.append(filterSectionWrapper1Unknown);
    filterSection.append(filterFieldset);
    return filterSection;
}

function observeResults(resultsSelector, cb) {
    const observer = new MutationObserver(mutxs => {
        for (const mutx of mutxs) {
            if (mutx.type === 'childList' && mutx.addedNodes) {
                mutx.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.querySelector(resultsSelector)) {
                        cb(node);
                    }
                });
            }
        }
    });

    const resultsContainer = document.querySelector(resultsSelector).parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
    observer.observe(resultsContainer, { childList: true, subtree: true });
    resultsContainer.classList.add('nla-observed');
    return observer;
}

async function mainFilter() {
    const domain = window.location.href.split('/')[2];
    let filtersContainer = null;
    let resultsSelector = null;
    let filterSection = null;
    if (domain.includes('pond5.com')) {
        filtersContainer = document.querySelector('div.SearchFilters-filtersSection');
        resultsSelector = 'a.SearchResultDSM';
        filterSection = makePond5FilterUI();
    } else if (domain.includes('elements.envato.com')) {
        await new Promise(r => setTimeout(r, 500));
        filtersContainer = document.querySelector('div[data-testid=filters-sidebar] > div > div');
        resultsSelector = 'div[data-testid=video-card] > div:nth-child(2)';
        filterSection = makeEnvatoFilterUI(filtersContainer);
    } else {
        console.error('Unknown site ' + domain);
    }

    filtersContainer.prepend(filterSection);

    let currentFilters = [];
    let checkboxes = document.querySelectorAll('.nla-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            currentFilters = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.name);
            filterResults(resultsSelector, currentFilters);
        });
    });

    GM_addStyle('.nla-hidden { display: none; }');
}

(async function () {
    'use strict';

    registerMenuCommands();

    const url = window.location.href;
    const pond5Regex = /https:\/\/www.pond5.com\/search\?/;
    const envatoVideoRegex = /https:\/\/elements.envato.com\/stock-video\//;
    const envatoPhotoRegex = /https:\/\/elements.envato.com\/photos\//;
    if (pond5Regex.exec(url) || envatoVideoRegex.exec(url) || envatoPhotoRegex.exec(url)) {
        console.log('Running filter mode');
        await mainFilter();
    } else {
        console.log('Running assistant mode');
        await mainAssistant();

        if (window.onurlchange === null) {
            window.addEventListener('urlchange', async () => {
                await new Promise(r => setTimeout(r, 500));
                await mainAssistant();
            });
        }
    }
})();
