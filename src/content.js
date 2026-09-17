import { PROFILE } from '../personal.config.js';

// Điền tên, ngày sinh nhật và cách xưng hô trong personal.config.js ở thư mục gốc.
// Chỉnh lời chúc, giao diện, nhịp độ và màu sắc trong file này.
// Các token tự thay theo thông tin cá nhân. Dùng {senderCapital}
// và {recipientCapital} ở đầu câu để viết hoa tự động.
export const CONTENT = {
  ...PROFILE,
  brand: 'Sinh nhật của {recipientName}',
  edition: 'DÀNH RIÊNG CHO {recipientName}',
  documentTitle: 'Chúc mừng sinh nhật, {recipientName} · {senderName}',
  openingTitle: 'Chúc mừng sinh nhật,\n{recipientName}!',
  openingLines: ['Chúc mừng', 'sinh nhật,', '{recipientName}!'],
  finalTitle: 'Chúc mừng sinh nhật, {recipientName}!',
  finalMessage: 'Chúc mừng sinh nhật, {recipientName}!\nChúc {recipient} có một ngày thật vui, có bánh, có những lời chúc ấm áp\nvà một điều ước khiến {recipient} háo hức khi thổi nến.\n\nTuổi mới, chúc {recipient} thật nhiều sức khỏe, bình an\nvà luôn được trân trọng theo cách mà {recipient} xứng đáng.\n\nMong những điều {recipient} đang cố gắng sẽ có kết quả tốt.\nMong {recipient} có thời gian cho những điều mình thích,\nvà có thật nhiều ngày được cười thoải mái.\n\nSinh nhật năm nay, {sender} chúc {recipient} thêm một điều:\nluôn thấy vui khi được là chính mình.\nChúc tuổi mới của {recipientName} thật đẹp, theo cách của riêng {recipient}.',
  finalSignature: PROFILE.signature,
  colors: {
    night: '#100914', pink: '#F4A7C3', blush: '#FFDCE8',
    pearl: '#FFF9FC', gold: '#E8C98D', text: '#FFF8FB', muted: '#E7DCE4',
  },
  timing: { camera: 1800, reveal: 8500, handoff: 6500, heartHold: 2600, heartDissolve: 1800 },
  giftHearts: { desktopCount: 60000, mobileCount: 8000, reducedCount: 1200 },
  garden: { roseColor: '#D9799F', ivoryColor: '#EEDCC8', roseCenter: '#9E476D', ivoryCenter: '#BA9875', leafColor: '#58674F', stemColor: '#6F785C' },
  audio: { enabled: false, src: 'audio/background.mp3', volume: 0.25 },
  ui: {
    dedication: PROFILE.birthday ? 'SINH NHẬT {recipientName} · {birthday}' : 'DÀNH RIÊNG CHO SINH NHẬT {recipientName}',
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
    meetingProgress: 'Hai con đường đang tìm về cùng một phía…',
    tapGift: 'Chạm để mở quà',
    readingProgress: 'Nhịp đọc của lời nhắn',
  },
  scenes: [
    {
      id: 'invitation', label: 'Lời mời', title: 'Chúc mừng sinh nhật,\n{recipientName}!',
      mobileTitle: 'Sinh nhật của\n{recipientName}!',
      paragraphs: [PROFILE.birthday ? 'Ngày {birthday} là ngày của {recipientName}.\n{senderCapital} đã chuẩn bị một chút bất ngờ,\nđể gửi {recipient} những lời chúc cho tuổi mới.' : 'Hôm nay là ngày của {recipientName}.\n{senderCapital} đã chuẩn bị một chút bất ngờ,\nđể gửi {recipient} những lời chúc cho tuổi mới.'],
      caption: 'Hôm nay, {recipient} là nhân vật chính.', captionItalic: 'Mọi lời chúc ở đây đều dành cho {recipient}.',
    },
    {
      id: 'meeting', label: 'Định mệnh', title: 'Giữa bao ngã rẽ,\nĐịnh mệnh.',
      mobileTitle: 'Định mệnh,\nlà gặp được {recipient}.',
      paragraphs: ['Giữa rất nhiều ngã rẽ,\nhai con đường bỗng tìm về cùng một phía.\nĐể {sender} gặp {recipient}, giữa bao nhiêu người.', 'Có lẽ, đó là định mệnh.\nVà hôm nay, {sender} thật vui vì được\nchuẩn bị một món quà nhỏ\nvà chúc mừng sinh nhật {recipientName}.'],
      interactions: ['{senderCapital} gọi cuộc gặp ấy là “Định mệnh”. Cảm ơn {recipient} đã xuất hiện, để ngày sinh nhật của {recipientName} cũng trở thành một ngày thật đặc biệt với {sender}.'],
      caption: 'Giữa rất nhiều ngã rẽ,', captionItalic: 'thật vui vì đã gặp được nhau.',
    },
    {
      id: 'distance', label: 'Những niềm vui nhỏ', title: 'Những điều nhỏ,\nlàm ngày vui hơn.',
      mobileTitle: 'Một chút vui,\ndành cho {recipient}.',
      paragraphs: ['Có những niềm vui bắt đầu\ntừ một cuộc trò chuyện, một tin nhắn\nhay một người mà mình chợt nhớ đến.', 'Trong ngày sinh nhật của {recipient},\n{sender} mong những niềm vui nhỏ như thế\nsẽ đến với {recipient} thật nhiều, hôm nay và cả tuổi mới.'],
      interactions: ['Một cuộc trò chuyện khiến ngày hôm đó vui hơn.', 'Một tin nhắn khiến ai đó vô thức mỉm cười.', 'Một người đôi khi được nhớ đến mà chẳng cần lý do.'],
      caption: 'Những niềm vui nhỏ hôm nay,', captionItalic: 'đi cùng {recipient} đến tuổi mới.',
    },
    {
      id: 'garden', label: 'Những điều tốt đẹp', title: 'Một khu vườn,\nnhững lời chúc.',
      mobileTitle: 'Những điều\ntốt đẹp.',
      paragraphs: ['Trong ngày sinh nhật của {recipient},\n{sender} gửi ba điều ước vào khu vườn này.', 'Chạm vào từng bông hoa,\nđể mở một lời chúc dành cho tuổi mới của {recipientName}.'],
      interactions: ['Chúc {recipient} bước sang tuổi mới với thật nhiều sức khỏe, bình an và những giấc ngủ ngon.', 'Chúc {recipient} có thêm những ngày vui, những chuyến đi đáng nhớ và thời gian cho những điều mình thích.', 'Chúc những điều {recipient} đang cố gắng sẽ có kết quả tốt, và {recipient} luôn có người chân thành ở bên.'],
      caption: 'Dành cho tuổi mới,', captionItalic: 'những điều thật xứng đáng.',
    },
    {
      id: 'time', label: 'Những phút giây đẹp', title: 'Tuổi mới,\nnhững phút giây đẹp.',
      mobileTitle: 'Tuổi mới,\nthật nhiều ngày vui.',
      paragraphs: ['Thêm một tuổi,\n{sender} mong {recipient} có thêm thời gian\ncho những điều khiến mình hạnh phúc.', 'Có những buổi sáng thong thả,\nnhững buổi tối được nghỉ ngơi,\nvà những khoảnh khắc mà khi nhớ lại,\n{recipient} vẫn thấy muốn mỉm cười.'],
      caption: 'Mỗi phút giây của tuổi mới,', captionItalic: 'mong đều có điều để {recipient} thấy vui.',
    },
    {
      id: 'gift', label: 'Món quà sinh nhật', title: 'Sinh nhật của {recipient},\nmột chút bất ngờ.',
      mobileTitle: 'Một món quà,\ndành riêng cho {recipient}.',
      paragraphs: ['Và đây là món quà\n{sender} đã chuẩn bị cho sinh nhật của {recipientName}.\nChạm nhẹ để mở nhé.'],
      revealedParagraphs: ['Món quà này mang theo lời chúc của {sender}:\nchúc {recipient} một tuổi mới thật vui và khỏe mạnh.', 'Mong mỗi ngày của {recipient} đều có\nnhững khoảnh khắc đáng nhớ,\nvà sinh nhật hôm nay sẽ là một trong số đó.'],
      celebration: 'CHÚC MỪNG SINH NHẬT',
      handoff: 'Và bây giờ…\nhãy mở món quà đang ở bên cạnh {recipient} nhé.',
      caption: 'Một món quà cho {recipient},', captionItalic: 'và những ngày đẹp ở phía trước.',
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
