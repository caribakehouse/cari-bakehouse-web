export interface Letter {
  id: string;
  title: string;
  salutation: string;
  paragraphs: string[];
  closing: string;
  signature: string;
  discount?: {
    code: string;
    discountText: string;
    description: string;
  };
  tag?: string;
}

export const LETTERS_DATA: Letter[] = [
  {
    id: "letter-1",
    tag: "Chút Ngọt Ngào",
    title: "Một chút ngọt ngào cho ngày hôm nay",
    salutation: "Chào bạn thân mến,",
    paragraphs: [
      "Nếu hôm nay bạn có đôi chút mệt mỏi với công việc hay nhịp sống vội vã, hy vọng một chiếc bánh nhỏ thơm mùi bơ và vani có thể làm dịu lại tâm trạng của bạn.",
      "Niềm vui đôi khi chẳng cần điều gì to tát, chỉ là một ngụm trà ấm và một miếng bánh ngọt mềm tan đúng điệu.",
      "Chúc bạn một ngày thật an yên và nhiều điều may mắn ghé thăm!",
    ],
    closing: "Thương mến,",
    signature: "Cari. Bakehouse",
    discount: {
      code: "SWEETCARI5",
      discountText: "GIẢM 5%",
      description: "Tặng bạn chút ngọt ngào cho đơn hàng kế tiếp",
    },
  },
  {
    id: "letter-2",
    tag: "Lời Tri Ân",
    title: "Cảm ơn bạn đã dừng chân ghé Cari.",
    salutation: "Gửi bạn một cái ôm ấm áp,",
    paragraphs: [
      "Cari. bắt đầu từ một tình yêu rất đơn giản: thích làm bánh và thích nhìn thấy nụ cười của mọi người khi thưởng thức.",
      "Mỗi lượt ghé thăm của bạn là niềm vui và động lực to lớn để tụi mình thức dậy sớm mỗi ngày, tự tay nhào bột và nướng những mẻ bánh vàng ươm thơm phức.",
      "Cảm ơn bạn vì đã trở thành một phần xinh xắn trong hành trình của Cari.!",
    ],
    closing: "Biết ơn & Yêu thương,",
    signature: "Đội ngũ Cari. Bakehouse",
  },
  {
    id: "letter-3",
    tag: "Món Quà Nhỏ",
    title: "Vũ trụ nhắn gửi: Bạn xứng đáng được tự thưởng!",
    salutation: "Bạn ơi,",
    paragraphs: [
      "Bạn đã làm việc chăm chỉ suốt những ngày qua rồi. Đừng quên dành cho bản thân những khoảng lặng nhỏ để yêu thương chính mình nhé.",
      "Một chiếc bánh kem mát lạnh hay một lát bánh bơ xốp thơm ngậy sẽ là món quà tuyệt vời nhất lúc này.",
      "Tụi mình gửi bạn một chiếc mã nhỏ xíu, coi như món quà khích lệ bạn nè!",
    ],
    closing: "Tự hào về bạn rất nhiều,",
    signature: "Cari. Bakehouse",
    discount: {
      code: "CARILOVE10",
      discountText: "GIẢM 10.000đ",
      description: "Áp dụng cho mọi đơn bánh ngọt tại tiệm",
    },
  },
  {
    id: "letter-4",
    tag: "Bếp Bánh Kể",
    title: "Hương thơm của hạnh phúc",
    salutation: "Gửi người bạn đáng yêu,",
    paragraphs: [
      "Bạn có biết khoảnh khắc hạnh phúc nhất trong căn bếp nhỏ của Cari. là gì không?",
      "Đó là khi mẻ bánh vừa ra lò, chiếc lò nướng ting lên một tiếng giòn giã và hương bơ Pháp béo ngậy lan toả khắp gian phòng.",
      "Tụi mình tin rằng chiếc bánh ngon nhất chính là chiếc bánh được làm bằng sự tỉ mỉ và cả trái tim chân thành. Mong chiếc bánh bạn cầm trên tay cũng mang trọn vẹn sự ấm áp ấy.",
    ],
    closing: "Từ căn bếp thơm lừng,",
    signature: "Thợ bánh nhà Cari.",
  },
  {
    id: "letter-5",
    tag: "Khoảng Lặng",
    title: "Chậm lại một chút thôi...",
    salutation: "Ghé tai nghe Cari. nhắn nhủ nè,",
    paragraphs: [
      "Giữa những ngày thế giới ngoài kia hối hả và tất bật, nhớ cho phép mình được 'lười biếng' một chút xíu.",
      "Chọn một góc quán quen, thưởng thức một lát bánh thơm và nghe bài nhạc bạn thích. Mọi việc rồi cũng sẽ có cách giải quyết thôi!",
      "Hôm nay bạn đã làm rất tốt rồi, cười một cái thật tươi nào!",
    ],
    closing: "Gửi bạn nụ cười ngọt ngào,",
    signature: "Cari. Bakehouse",
  },
  {
    id: "letter-6",
    tag: "Năng Lượng Tươi Mới",
    title: "Mẻ bánh mới cho ngày mới rực rỡ",
    salutation: "Chúc bạn một ngày thật tuyệt vời!",
    paragraphs: [
      "Mỗi sớm mai thức dậy là một khởi đầu mới tinh tươm, tựa như khối bột mịn màng đang sẵn sàng nở phồng trong lò ấm.",
      "Chúc cho mọi dự định hôm nay của bạn đều suôn sẻ, niềm vui luôn đầy ắp và nếu có thèm ngọt thì Cari. luôn ở đây đợi bạn nhé!",
    ],
    closing: "Chúc bạn ngày mới thơm lành,",
    signature: "Cari. Bakehouse",
    discount: {
      code: "FRESHDAY",
      discountText: "QUÀ TẶNG",
      description: "Tặng kèm thiệp viết tay xinh xắn theo yêu cầu",
    },
  },
  {
    id: "letter-7",
    tag: "Lời Nhắn Nhỏ",
    title: "Vị ngọt dành cho tâm hồn bạn",
    salutation: "Xin chào bạn,",
    paragraphs: [
      "Người ta bảo vị ngọt của đường và bơ có thể xoa dịu những mệt mỏi trong tâm hồn, Cari. cũng luôn tin như thế.",
      "Tụi mình chọn từng quả dâu tươi, từng thanh chocolate nguyên chất để tạo nên những chiếc bánh không chỉ ngon miệng mà còn đem lại cảm giác dễ chịu khi ăn.",
      "Hy vọng hôm nay bạn cũng nhận được thật nhiều điều dịu dàng như vị kem tươi Cari. nhé!",
    ],
    closing: "Thương mến gửi trao,",
    signature: "Cari. Bakehouse",
  },
];

/**
 * Lấy ngẫu nhiên một lá thư từ danh sách, có thể truyền id hiện tại để tránh trùng lặp
 */
export function getRandomLetter(currentId?: string): Letter {
  const pool = currentId
    ? LETTERS_DATA.filter((l) => l.id !== currentId)
    : LETTERS_DATA;
  const targetPool = pool.length > 0 ? pool : LETTERS_DATA;
  const randomIndex = Math.floor(Math.random() * targetPool.length);
  return targetPool[randomIndex];
}
