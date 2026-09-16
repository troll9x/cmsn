// Chỉnh mọi nội dung cá nhân, giao diện, nhịp độ và màu sắc ở đây.
// Các token tự thay theo tên và đại từ bên dưới. Dùng {senderCapital}
// và {recipientCapital} ở đầu câu để viết hoa tự động.
export const CONTENT = {
  recipientName: 'Chi',
  senderName: 'Sơn',
  senderPronoun: 'anh',
  recipientPronoun: 'em',
  brand: 'Một chút đặc biệt',
  edition: 'THE BIRTHDAY EDITION',
  documentTitle: 'Một chút đặc biệt · Happy Birthday',
  openingTitle: 'Gửi đến một cô gái đặc biệt…',
  openingLines: ['Gửi đến một', 'cô gái', 'đặc biệt…'],
  finalTitle: 'Happy Birthday, {recipientName}',
  finalMessage: 'Chúc {recipient} có một tuổi mới thật rạng rỡ, bình an\nvà luôn được trân trọng theo cách mà {recipient} xứng đáng.\n\nCảm ơn {recipient} vì đã xuất hiện\nvà cho {sender} cơ hội được hiểu {recipient} nhiều hơn một chút.\n\n{senderCapital} không muốn vội vàng đặt tên cho điều đang có.\nChỉ mong sau ngày hôm nay,\nchúng ta sẽ có thêm nhiều khoảng thời gian vui vẻ bên nhau.\n\nChúc mừng sinh nhật, {recipientName}.',
  finalSignature: '— Từ {senderName}',
  colors: {
    night: '#100914', pink: '#F4A7C3', blush: '#FFDCE8',
    pearl: '#FFF9FC', gold: '#E8C98D', text: '#FFF8FB', muted: '#E7DCE4',
  },
  timing: { camera: 1800, reveal: 8500, handoff: 6500, heartHold: 2600, heartDissolve: 1800 },
  giftHearts: { desktopCount: 60000, mobileCount: 8000, reducedCount: 1200 },
  garden: { roseColor: '#D9799F', ivoryColor: '#EEDCC8', roseCenter: '#9E476D', ivoryCenter: '#BA9875', leafColor: '#58674F', stemColor: '#6F785C' },
  audio: { enabled: false, src: 'audio/background.mp3', volume: 0.25 },
  ui: {
    dedication: 'MỘT HÀNH TRÌNH DÀNH RIÊNG CHO {recipient}',
    start: 'Bắt đầu hành trình', next: 'Đi tiếp', back: 'Quay lại',
    save: 'Lưu giữ khoảnh khắc này', replay: 'Xem lại hành trình',
    openGift: 'Chạm để mở món quà', giftOpening: 'Một chút bất ngờ đang mở ra…',
    saved: 'Khoảnh khắc đẹp sẽ ở lại, theo cách riêng của nó.',
    saving: 'Giữ lại một chút ánh sáng…',
    duration: '4–5 phút, theo nhịp của {recipient}',
    soundOn: 'Tắt âm thanh', soundOff: 'Bật âm thanh', soundUnavailable: 'Chưa có nhạc nền',
    swipe: 'Vuốt trái hoặc lên để đi tiếp', keyboard: 'Dùng phím ← → để khám phá',
    loading: 'Đang thắp lên những điều nhỏ bé…',
    fallback: 'Thiết bị chưa hỗ trợ không gian 3D. Những lời chúc vẫn ở đây, dành cho {recipient}.',
    progress: 'Tiến trình hành trình', collected: 'đã khám phá',
    explore: 'Chạm vào ánh sáng để khám phá', complete: 'Con đường phía trước đã mở',
    crystal: 'Khám phá trái tim pha lê', flower: 'Mở bông hoa', meeting: 'Chạm vào giao điểm ánh sáng',
    scene: 'CẢNH', introLabel: 'LỜI MỜI', closingLabel: 'LỜI CHÚC CUỐI',
    footer: 'ĐƯỢC CHUẨN BỊ BẰNG MỘT CHÚT CHÂN THÀNH',
    scroll: 'Cuộn để đọc trọn lời nhắn',
    keepsakes: 'Những điều nhỏ bé đi cùng {recipient}',
    tapHint: 'Chạm nhẹ ở bất kỳ đâu để tiếp tục',
    tapExplore: 'Chạm nhẹ để mở một điều nhỏ bé',
    tapContinue: 'Chạm để đọc tiếp',
    tapStart: 'Chạm để bắt đầu',
    tapGift: 'Chạm để mở quà',
    readingProgress: 'Nhịp đọc của lời nhắn',
  },
  scenes: [
    {
      id: 'invitation', label: 'Lời mời', title: 'Gửi đến một cô gái đặc biệt…',
      mobileTitle: 'Một chút\nđặc biệt…',
      paragraphs: ['Có vài điều chưa cần vội gọi thành tên.\nNhưng sinh nhật của {recipient} là một lý do đủ đẹp\nđể {sender} chuẩn bị hành trình nhỏ này.'],
      caption: 'Mỗi điều đẹp đẽ,', captionItalic: 'đều bắt đầu từ một chút ánh sáng.',
    },
    {
      id: 'meeting', label: 'Cuộc gặp gỡ', title: 'Một cuộc gặp,\nkhông báo trước.',
      mobileTitle: 'Thật vui,\nvì đã gặp nhau.',
      paragraphs: ['Có những người xuất hiện trong cuộc sống\nmà chẳng cần một lời báo trước.', 'Ban đầu chỉ là một cuộc gặp gỡ bình thường…\nrồi chẳng biết từ lúc nào,\nngười ấy lại trở nên đặc biệt hơn một chút.'],
      interactions: ['Có lẽ điều đẹp nhất không phải là chúng ta đã gặp nhau thế nào… mà là sau cuộc gặp ấy, chúng ta vẫn muốn tiếp tục trò chuyện.'],
      caption: 'Giữa rất nhiều ngã rẽ,', captionItalic: 'thật vui vì đã gặp được nhau.',
    },
    {
      id: 'distance', label: 'Một khoảng cách', title: 'Có những điều,\nchưa cần gọi tên.',
      mobileTitle: 'Chưa cần\ngọi thành tên.',
      paragraphs: ['Chúng ta chưa có thật nhiều kỷ niệm.\nChưa có một câu chuyện đủ dài để kể.', 'Nhưng có một khoảng cách rất lạ…\nkhông quá gần để gọi tên,\ncũng chẳng còn xa như những người bạn bình thường.'],
      interactions: ['Một cuộc trò chuyện khiến ngày hôm đó vui hơn.', 'Một tin nhắn khiến ai đó vô thức mỉm cười.', 'Một người đôi khi được nhớ đến mà chẳng cần lý do.'],
      caption: 'Hai dải ánh sáng,', captionItalic: 'một khoảng cách thật dịu dàng.',
    },
    {
      id: 'garden', label: 'Những điều tốt đẹp', title: 'Một khu vườn,\nnhững lời chúc.',
      mobileTitle: 'Những điều\ntốt đẹp.',
      paragraphs: ['Có một khu vườn nhỏ trên mây,\nnơi những điều tốt đẹp đang đợi {recipient}.', 'Chạm vào từng bông hoa,\nđể một lời chúc được nở thành ánh sáng.'],
      interactions: ['Chúc {recipient} bước sang tuổi mới với thật nhiều bình an.', 'Chúc {recipient} luôn rạng rỡ, không chỉ trong mắt người khác mà cả trong cách {recipient} nhìn chính mình.', 'Chúc {recipient} gặp được những người chân thành, những niềm vui xứng đáng và những điều khiến trái tim cảm thấy nhẹ nhàng.'],
      caption: 'Dành cho tuổi mới,', captionItalic: 'những điều thật xứng đáng.',
    },
    {
      id: 'time', label: 'Cứ chậm rãi thôi', title: 'Thời gian,\nkhông cần vội.',
      mobileTitle: 'Cứ chậm rãi\nthôi…',
      paragraphs: ['Có những mối quan hệ không cần phải vội vàng.', 'Không nhất thiết hôm nay phải gọi tên điều đang có.\nChỉ cần mỗi lần ở cạnh nhau,\nchúng ta đều cảm thấy vui hơn một chút…\nnhư vậy đã là một điều đáng quý.'],
      caption: 'Không cần đếm thời gian,', captionItalic: 'chỉ cần những phút giây đáng nhớ.',
    },
    {
      id: 'gift', label: 'Một chút bất ngờ', title: 'Ở cuối con đường,\nmột món quà nhỏ.',
      mobileTitle: 'Một chút\nbất ngờ.',
      paragraphs: ['Có một điều {sender} đã giữ lại\nđể dành cho khoảnh khắc này.'],
      revealedParagraphs: ['Món quà này không phải để nhắc {recipient} phải dành thời gian cho một ai.', '{senderCapital} chỉ mong trong tuổi mới,\nmỗi ngày của {recipient} đều có thật nhiều khoảnh khắc đáng nhớ.'],
      celebration: 'CHÚC MỪNG SINH NHẬT',
      handoff: 'Và bây giờ…\nhãy nhìn món quà đang ở bên cạnh {recipient}.',
      caption: 'Một món quà cho {recipient},', captionItalic: 'và những ngày đẹp ở phía trước.',
    },
    {
      id: 'closing', label: 'Dành cho {recipient}', title: 'Happy Birthday, {recipientName}',
      mobileTitle: 'Happy Birthday,\n{recipientName}',
      paragraphs: [], caption: 'Một tuổi mới thật rạng rỡ.', captionItalic: 'Một hành trình vẫn còn ở phía trước.',
    },
  ],
};

export function text(value) {
  const capitalize = (s) => s.charAt(0).toLocaleUpperCase('vi') + s.slice(1);
  const tokens = {
    recipientName: CONTENT.recipientName, senderName: CONTENT.senderName,
    sender: CONTENT.senderPronoun, recipient: CONTENT.recipientPronoun,
    senderCapital: capitalize(CONTENT.senderPronoun), recipientCapital: capitalize(CONTENT.recipientPronoun),
  };
  return String(value).replace(/\{(\w+)\}/g, (match, key) => tokens[key] ?? match);
}
