import { PROFILE } from '../personal.config.js';

// Điền tên, ngày sinh nhật và cách xưng hô trong personal.config.js ở thư mục gốc.
// Chỉnh lời chúc, giao diện, nhịp độ và màu sắc trong file này.
// Các token tự thay theo thông tin cá nhân. Dùng {senderCapital}
// và {recipientCapital} ở đầu câu để viết hoa tự động.
export const CONTENT = {
  ...PROFILE,
  brand: ' Chúc mừng sinh nhật em ',
  edition: 'DÀNH RIÊNG CHO CHI',
  documentTitle: 'Chúc mừng sinh nhật, {recipientName} · {senderName}',
  openingTitle: 'Chúc mừng sinh nhật,\n{recipientName}!',
  openingLines: ['Chúc mừng', 'sinh nhật,', '{recipientName}!'],
  finalTitle: 'Chúc mừng sinh nhật, {recipientName}!',
  finalMessage: 'Chúc mừng sinh nhật, {recipientName}!\nTrong mắt {sender}, {recipient} luôn là một cô gái rất xinh đẹp.\nMong tuổi mới mang đến thật nhiều niềm vui, để nụ cười ấy còn rạng rỡ hơn nữa.\n\nChúc {recipient} luôn khỏe mạnh, bình an và thật nhiều hạnh phúc.\nMong {recipient} được yêu thương, được lắng nghe\nvà luôn được trân trọng theo cách {recipient} xứng đáng.\n\nMong mọi điều {recipient} đang âm thầm cố gắng\nsẽ dần trở thành kết quả khiến {recipient} tự hào.\nMong những ngày phía trước thật dịu dàng với {recipient}\nvà mang đến thật nhiều niềm vui bất ngờ.\n\nCảm ơn {recipient} vì đã xuất hiện trong cuộc sống của {sender}.\n{senderCapital} mong tuổi mới của {recipient} sẽ thật đẹp,\nvà buổi tối hôm nay sẽ là một kỷ niệm đáng nhớ của chúng ta.',
  finalSignature: PROFILE.signature,
  colors: {
    night: '#100914', pink: '#F4A7C3', blush: '#FFDCE8',
    pearl: '#FFF9FC', gold: '#E8C98D', text: '#FFF8FB', muted: '#E7DCE4',
  },
  timing: { camera: 1800, reveal: 8500, handoff: 6500, heartHold: 2600, heartDissolve: 1800 },
  giftHearts: { desktopCount: 60000, mobileCount: 8000, reducedCount: 1200 },
  garden: { roseColor: '#D9799F', ivoryColor: '#EEDCC8', roseCenter: '#9E476D', ivoryCenter: '#BA9875', leafColor: '#58674F', stemColor: '#6F785C' },
  audio: { enabled: true, src: 'audio/background.mp3', volume: 0.25 },
  ui: {
    dedication: PROFILE.birthday ? '♥ HAPPY BIRTHDAY MY LOVE ♥' : 'DÀNH RIÊNG CHO SINH NHẬT CHI',
    start: 'Bắt đầu hành trình', next: 'Đi tiếp', back: 'Quay lại',
    save: 'Lưu giữ khoảnh khắc này', replay: 'Xem lại hành trình',
    openGift: 'Chạm để mở lời hẹn', giftOpening: 'Một lời hẹn đang hiện ra…',
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
    meetingProgress: 'Hai con đường đang tìm về cùng một phía…',
    tapGift: 'Chạm để mở lời hẹn',
    readingProgress: 'Nhịp đọc của lời nhắn',
  },
  scenes: [
    {
      id: 'invitation', label: 'Lời mời', title: 'Chúc mừng sinh nhật,\n{recipientName}!',
      mobileTitle: 'Chúc mừng sinh nhật\n{recipientName}!',
      paragraphs: [PROFILE.birthday ? 'Ngày {birthday} cuối cùng cũng đã đến.\nHôm nay là một ngày thật đặc biệt —\nngày cô gái đặc biệt nhất trong mắt {sender}\nbước sang tuổi mới.\n\n{senderCapital} đã chờ đến khoảnh khắc này\nđể nói với {recipient} những điều vẫn luôn cất trong lòng.\nVà tất cả những điều sắp tới,\n{sender} chỉ muốn dành riêng cho {recipient}.' : 'Ngày đặc biệt của {recipientName} cuối cùng cũng đã đến.\nHôm nay, cô gái đặc biệt nhất trong mắt {sender}\nđã bước sang tuổi mới.\n\n{senderCapital} đã chờ đến khoảnh khắc này\nđể nói với {recipient} những điều vẫn luôn cất trong lòng.\nVà tất cả những điều sắp tới,\n{sender} chỉ muốn dành riêng cho {recipient}.'],
      caption: PROFILE.birthday ? 'Khoảnh khắc ngày {birthday} bắt đầu,' : 'Khoảnh khắc ngày đặc biệt bắt đầu,', captionItalic: 'cũng là lúc tuổi mới của {recipient} mở ra.',
    },
    {
      id: 'meeting', label: 'Định mệnh', title: 'Giữa bao ngã rẽ,\nĐịnh mệnh.',
      mobileTitle: 'Định mệnh,\nlà gặp được {recipient}.',
      paragraphs: ['Giữa rất nhiều ngã rẽ,\nhai con đường bỗng tìm về cùng một phía.\nĐể {sender} gặp {recipient}, giữa bao nhiêu người.', 'Có lẽ, đó là định mệnh.\nVà điều khiến {sender} vui hơn cả,\nlà ngày hôm nay {sender} được ở đây\nđể dành những lời chúc tốt đẹp nhất cho {recipient}.'],
      interactions: ['{senderCapital} gọi cuộc gặp ấy là “Định mệnh”. Cảm ơn {recipient} đã xuất hiện và khiến những ngày bình thường của {sender} trở nên đặc biệt hơn!'],
      caption: 'Giữa rất nhiều ngã rẽ,', captionItalic: 'thật vui vì đã gặp được nhau.',
    },
    {
      id: 'distance', label: 'Có em', title: 'Có {recipient},\nngày vui hơn.',
      mobileTitle: 'Có {recipient},\nngày vui hơn.',
      paragraphs: ['{senderCapital} không nhớ từ khi nào,\nnhưng những cuộc trò chuyện với {recipient}\nđã trở thành một phần vui trong ngày.', 'Chỉ một tin nhắn, một câu chuyện,\nhay đôi lúc chợt nghĩ đến {recipient} —\ncũng đủ khiến {sender} mỉm cười.'],
      interactions: ['Nói chuyện với {recipient} một lúc thôi, ngày hôm đó của {sender} cũng vui hơn rồi.', 'Có những lúc nhìn thấy tin nhắn của {recipient}, {sender} đã ngồi cười một mình.', 'Và có những lúc chẳng vì lý do gì, {sender} chỉ chợt nhớ đến {recipient} thôi.'],
      caption: 'Vì đôi khi chỉ cần nghĩ đến {recipient},', captionItalic: '{sender} đã thấy ngày hôm đó vui hơn.',
    },
    {
      id: 'garden', label: 'Những điều tốt đẹp', title: 'Một khu vườn,\nnhững lời chúc.',
      mobileTitle: 'Những điều\ntốt đẹp.',
      paragraphs: ['Có những điều {sender} mong\nsẽ đến với {recipient} trong tuổi mới.\n{senderCapital} gửi chúng vào khu vườn này.'],
      interactions: ['Chúc {recipient} luôn khỏe mạnh, bình an và thật nhiều điều hạnh phúc!', 'Chúc {recipient} luôn xinh đẹp và rạng rỡ — không chỉ trong mắt mọi người, mà cả trong cách {recipient} nhìn chính mình!', 'Chúc {recipient} luôn được yêu thương, được trân trọng và nhận về những điều tốt đẹp!'],
      caption: 'Mỗi bông hoa nở,', captionItalic: 'là một lời chúc dành riêng cho {recipient}.',
    },
    {
      id: 'time', label: 'Hạnh phúc tuổi mới', title: 'Tuổi mới,\nthật nhiều hạnh phúc.',
      mobileTitle: 'Tuổi mới,\nthật nhiều hạnh phúc.',
      paragraphs: ['Thêm một tuổi mới,\n{sender} mong {recipient} vẫn luôn xinh đẹp, tự tin\nvà được sống theo cách khiến mình hạnh phúc.', 'Mong {recipient} có những ngày thật vui,\nnhững giấc mơ đáng để chờ đợi,\nvà những khoảnh khắc mà khi nhớ lại,\n{recipient} vẫn mỉm cười thật lâu.'],
      caption: 'Tuổi mới của {recipient},', captionItalic: 'mong sẽ rạng rỡ như chính nụ cười ấy.',
    },
    {
      id: 'gift', label: 'Hẹn em tối nay', title: 'Chiều nay,\nMình rảnh chứ?',
      mobileTitle: 'Chiều nay,\nMình rảnh chứ?',
      paragraphs: ['Ở cuối hành trình này,\n{sender} vẫn còn đôi lời muốn dành riêng cho {recipient}.\nChạm nhẹ để đọc nhé.'],
      revealedParagraphs: ['Chúc cô gái xinh đẹp của hôm nay\nmột tuổi mới thật vui, thật hạnh phúc\nvà luôn có thật nhiều lý do để mỉm cười.', 'Giữa tất cả những lời chúc ấy,\n{sender} muốn giữ lại một điều cho riêng buổi tối nay —\nkhoảng thời gian {sender} được ở bên {recipient}.'],
      celebration: 'CHÚC MỪNG SINH NHẬT',
      handoff: 'Hẹn gặp {recipient} tối nay, {recipientName}.\n{senderCapital} mong đó sẽ là một buổi tối thật đẹp.',
      caption: 'Hẹn gặp {recipient} tối nay,', captionItalic: 'cho một buổi tối thật đẹp.',
    },
    {
      id: 'closing', label: 'Dành cho {recipient}', title: 'Chúc mừng sinh nhật, {recipientName}!',
      mobileTitle: 'Chúc mừng sinh nhật,\n{recipientName}!',
      paragraphs: [], caption: 'Chúc mừng sinh nhật, {recipientName}.', captionItalic: 'Tuổi mới, thật nhiều ngày vui.',
    },
  ],
};

export function text(value) {
  const capitalize = (s) => s.charAt(0).toLocaleUpperCase('vi') + s.slice(1);
  const tokens = {
    recipientName: CONTENT.recipientName, senderName: CONTENT.senderName, birthday: CONTENT.birthday,
    sender: CONTENT.senderPronoun, recipient: CONTENT.recipientPronoun,
    senderCapital: capitalize(CONTENT.senderPronoun), recipientCapital: capitalize(CONTENT.recipientPronoun),
  };
  return String(value).replace(/\{(\w+)\}/g, (match, key) => tokens[key] ?? match).normalize('NFC');
}
