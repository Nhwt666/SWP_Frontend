import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/BlogPostPage.css';
import Header from '../components/Header';
import { getBlogs, resetBlogs } from '../blogService';

const mockBlogPosts = [
  {
    slug: '1',
    title: 'Tại sao xét nghiệm ADN lại quan trọng?',
    image: '/blog1.jpg',
    author: 'Dr. Nguyễn Văn A',
    date: '2024-05-01',
    content: [
      { type: 'h3', text: '1. Xác minh quan hệ huyết thống' },
      { type: 'p', text: 'Ý nghĩa: Giúp xác định mối quan hệ cha – con, mẹ – con, anh chị em, ông bà – cháu...'},
      { type: 'highlight', text: 'Dẫn chứng: Theo Viện Công nghệ Sinh học (Viện Hàn lâm KH&CN Việt Nam), tỉ lệ chính xác của xét nghiệm ADN huyết thống đạt đến 99,9999% khi xác định có quan hệ, và 100% khi kết luận không có quan hệ.' },
      { type: 'p', text: 'Ứng dụng thực tế: Xác định quyền thừa kế tài sản, đoàn tụ gia đình bị thất lạc, hoặc giải quyết tranh chấp pháp lý.' },
      { type: 'h3', text: '2. Chẩn đoán và phòng ngừa bệnh di truyền' },
      { type: 'p', text: 'Ý nghĩa: Giúp phát hiện sớm các bệnh di truyền như Thalassemia, ung thư vú di truyền (BRCA1/BRCA2), hội chứng Down, rối loạn chuyển hóa...'},
      { type: 'highlight', text: 'Dẫn chứng: Theo Tổ chức Y tế Thế giới (WHO), hơn 10.000 bệnh lý có liên quan đến gen có thể được phát hiện thông qua xét nghiệm ADN.' },
      { type: 'p', text: 'Ứng dụng thực tế: Trong chương trình sàng lọc trước sinh, các bà mẹ mang thai có thể xét nghiệm ADN của thai nhi để phát hiện bất thường nhiễm sắc thể mà không cần can thiệp xâm lấn.' },
      { type: 'h3', text: '3. Hỗ trợ điều trị y học cá thể hóa (personalized medicine)' },
      { type: 'p', text: 'Ý nghĩa: Dựa vào đặc điểm di truyền để lựa chọn loại thuốc phù hợp, liều lượng tối ưu.' },
      { type: 'highlight', text: 'Dẫn chứng: Nghiên cứu đăng trên tạp chí Nature Reviews Genetics (2021) cho thấy các xét nghiệm gen liên quan đến enzym CYP450 giúp bác sĩ xác định người bệnh có thể bị phản ứng phụ hoặc không đáp ứng với thuốc như warfarin, clopidogrel hay codeine.' },
      { type: 'p', text: 'Ứng dụng thực tế: Điều trị ung thư bằng liệu pháp nhắm trúng đích (targeted therapy) chỉ hiệu quả nếu xác định đúng đột biến gen (ví dụ: gen EGFR, ALK trong ung thư phổi).' },
      { type: 'h3', text: '4. Giải quyết các vụ án hình sự và dân sự' },
      { type: 'p', text: 'Ý nghĩa: ADN có thể được sử dụng để xác định danh tính thủ phạm hoặc minh oan cho người bị kết án sai.' },
      { type: 'highlight', text: 'Dẫn chứng: Theo FBI (Hoa Kỳ), từ khi thành lập hệ thống CODIS (Combined DNA Index System), hơn 500 người vô tội đã được minh oan nhờ bằng chứng ADN, và hàng nghìn tội phạm bị truy tố nhờ ADN tại hiện trường.' },
      { type: 'p', text: 'Ứng dụng thực tế: Tại Việt Nam, nhiều vụ án như bé trai bị bỏ rơi tại chùa đã xác định được người thân thật sự nhờ xét nghiệm ADN.' },
      { type: 'h3', text: '5. Truy tìm nguồn gốc tổ tiên, dân tộc học và nghiên cứu gen' },
      { type: 'p', text: 'Ý nghĩa: Giúp cá nhân biết rõ về tổ tiên, dòng dõi, và nguồn gốc chủng tộc.' },
      { type: 'highlight', text: 'Dẫn chứng: Các công ty như 23andMe hay AncestryDNA đã cung cấp dịch vụ phân tích gen cho hàng triệu người trên toàn thế giới, tiết lộ thông tin về tỷ lệ phần trăm gen từ các khu vực như Đông Á, Châu Phi, Bắc Âu...' },
      { type: 'p', text: 'Ứng dụng thực tế: Nhiều người đã tìm lại được người thân thất lạc thông qua kết quả trùng khớp ADN từ hệ thống của các công ty này.' },
      { type: 'h3', text: 'Kết luận' },
      { type: 'p', text: 'Xét nghiệm ADN không chỉ là công cụ xác minh quan hệ huyết thống, mà còn là một bước tiến lớn của y học hiện đại, hỗ trợ chẩn đoán, điều trị, truy vết tội phạm và khám phá bản thân. Với độ chính xác gần như tuyệt đối và giá trị pháp lý cao, xét nghiệm ADN đang ngày càng trở nên phổ biến và thiết yếu trong nhiều lĩnh vực của đời sống xã hội.' },
    ]
  },
  {
    slug: '2',
    title: 'Quy trình xét nghiệm ADN diễn ra như thế nào?',
    image: '/blog2.jpg',
    author: 'Dr. Trần Thị B',
    date: '2024-05-03',
    content: [
      { type: 'p', text: 'Xét nghiệm ADN là một quá trình khoa học được thực hiện chặt chẽ qua nhiều bước để đảm bảo kết quả chính xác tuyệt đối. Tùy mục đích xét nghiệm (huyết thống, bệnh di truyền, pháp y...), quy trình có thể thay đổi đôi chút, nhưng nhìn chung sẽ trải qua các giai đoạn sau:' },
      { type: 'h3', text: '1. Tư vấn và tiếp nhận yêu cầu' },
      { type: 'p', text: 'Ý nghĩa: Người dân đến trung tâm xét nghiệm sẽ được tư vấn về mục đích, loại xét nghiệm cần thực hiện và quy trình liên quan.' },
      { type: 'highlight', text: 'Dẫn chứng: Tại Trung tâm Phân tích ADN & Công nghệ di truyền (GENTIS), khách hàng sẽ được tư vấn bởi chuyên viên trước khi thực hiện lấy mẫu, để đảm bảo chọn đúng loại xét nghiệm (ví dụ: cha – con, ông – cháu, ADN thai nhi…).' },
      { type: 'p', text: 'Hồ sơ cần thiết: CMND/CCCD, đơn đăng ký xét nghiệm, trong một số trường hợp có thể cần giấy khai sinh hoặc giấy xác nhận của pháp luật.' },
      { type: 'h3', text: '2. Thu mẫu ADN' },
      { type: 'p', text: 'Các loại mẫu phổ biến:' },
      { type: 'ul', items: [
        'Mẫu niêm mạc miệng (dùng tăm bông quệt nhẹ bên trong má).',
        'Mẫu máu (thường lấy từ đầu ngón tay).',
        'Mẫu tế bào khác: tóc có chân, móng tay, cuống rốn, tinh dịch, bàn chải đánh răng, thậm chí xương hoặc răng (trong các trường hợp pháp y).'
      ]},
      { type: 'h3', text: '3. Chiết tách ADN' },
      { type: 'p', text: 'Quy trình: Mẫu sinh phẩm được xử lý bằng hóa chất để tách ADN ra khỏi tế bào, sau đó ADN được làm sạch và bảo quản.' },
      { type: 'highlight', text: 'Dẫn chứng: Các trung tâm sử dụng công nghệ chiết tách ADN tự động bằng robot sinh học hoặc máy ly tâm hiện đại (như máy QIAGEN QIAcube) giúp tăng độ tinh khiết và giảm sai sót thủ công.' },
      { type: 'h3', text: '4. Khuếch đại ADN bằng PCR' },
      { type: 'p', text: 'Ý nghĩa: ADN sau khi chiết tách thường rất ít, cần được khuếch đại lên hàng triệu bản sao bằng kỹ thuật PCR (Polymerase Chain Reaction).' },
      { type: 'highlight', text: 'Dẫn chứng: Máy PCR được sử dụng phổ biến là Applied Biosystems™ 9700, có khả năng khuếch đại nhiều đoạn gen cùng lúc, đảm bảo kết quả chính xác trong thời gian ngắn.' },
      { type: 'h3', text: '5. Phân tích trình tự hoặc kiểu gen' },
      { type: 'p', text: 'Xét nghiệm huyết thống: So sánh từ 16–33 loci gen STR giữa hai hoặc nhiều người để xác định mức độ tương đồng di truyền.' },
      { type: 'p', text: 'Xét nghiệm bệnh lý di truyền: Phân tích trình tự nucleotide trên một gen cụ thể (ví dụ gen BRCA1/2, gen HBB…).' },
      { type: 'highlight', text: 'Dẫn chứng: Theo tiêu chuẩn ISFG (International Society for Forensic Genetics), một xét nghiệm cha – con đạt độ chính xác trên 99,999% khi có từ 20 loci gen trùng khớp.' },
      { type: 'h3', text: '6. Đọc kết quả và trả kết quả' },
      { type: 'p', text: 'Thời gian: Từ 4 giờ đến 7 ngày tùy loại xét nghiệm.' },
      { type: 'p', text: 'Hình thức trả kết quả: Trực tiếp, online có bảo mật hoặc gửi bản cứng có đóng dấu pháp lý.' },
      { type: 'highlight', text: 'Dẫn chứng: Tại GENTIS, kết quả được xác nhận bởi chuyên gia di truyền học và có giá trị pháp lý nếu khách hàng yêu cầu xét nghiệm phục vụ tòa án hoặc hành chính.' },
      { type: 'h3', text: '7. Tư vấn sau xét nghiệm' },
      { type: 'p', text: 'Nếu là xét nghiệm bệnh lý, khách hàng sẽ được tư vấn cách phòng ngừa hoặc hướng điều trị.' },
      { type: 'p', text: 'Nếu là xét nghiệm huyết thống, sẽ được hỗ trợ pháp lý nếu cần thực hiện các bước tiếp theo (như làm giấy khai sinh, thủ tục thừa kế...).' },
      { type: 'h3', text: 'Kết luận' },
      { type: 'p', text: 'Quy trình xét nghiệm ADN là một chuỗi các bước khoa học chặt chẽ, được thực hiện bằng công nghệ sinh học tiên tiến để đảm bảo độ chính xác gần như tuyệt đối. Mỗi bước — từ thu mẫu, chiết tách, khuếch đại cho đến phân tích — đều tuân theo tiêu chuẩn quốc tế như ISO 17025, giúp kết quả có thể sử dụng cho cả mục đích cá nhân lẫn pháp lý. Điều này lý giải vì sao xét nghiệm ADN ngày càng được tin tưởng và sử dụng rộng rãi trong xã hội hiện đại.' },
    ]
  },
  {
    slug: '3',
    title: 'Những lầm tưởng phổ biến về xét nghiệm ADN',
    image: '/blog3.jpg',
    author: 'Dr. Lê Văn C',
    date: '2024-05-05',
    content: [
      { type: 'p', text: 'Xét nghiệm ADN ngày càng phổ biến trong đời sống, đặc biệt trong các lĩnh vực y tế, pháp lý và nghiên cứu huyết thống. Tuy nhiên, vẫn tồn tại nhiều lầm tưởng sai lệch khiến người dân hiểu nhầm về bản chất, khả năng và giới hạn của công nghệ này. Dưới đây là những quan niệm sai phổ biến, kèm dẫn chứng cụ thể để làm rõ:' },
      { type: 'h3', text: '1. Xét nghiệm ADN luôn cho kết quả chính xác 100%' },
      { type: 'p', text: 'Sự thật: Xét nghiệm ADN có độ chính xác rất cao, lên đến 99,9999% đối với huyết thống, nhưng không phải luôn là 100% tuyệt đối trong mọi trường hợp.' },
      { type: 'highlight', text: 'Dẫn chứng: Theo Hiệp hội Di truyền học Hoa Kỳ (ASHG), độ tin cậy phụ thuộc vào số lượng loci gen được xét nghiệm và chất lượng mẫu. Với mẫu không đạt chuẩn (như tóc rụng không có chân tóc, mẫu nhiễm tạp...), kết quả có thể bị sai lệch.' },
      { type: 'h3', text: '2. Chỉ có thể xét nghiệm ADN bằng mẫu máu' },
      { type: 'p', text: 'Sự thật: ADN có mặt trong hầu hết các tế bào của cơ thể, không chỉ có trong máu.' },
      { type: 'highlight', text: 'Dẫn chứng: Theo các trung tâm xét nghiệm hàng đầu như GENTIS và GENLAB, các mẫu như: niêm mạc miệng, tóc có chân, móng tay, bàn chải đánh răng đều có thể dùng để xét nghiệm ADN, miễn là còn chứa tế bào sống có nhân.' },
      { type: 'h3', text: '3. Chỉ người mẹ mới xác định được con ruột, còn người cha thì không chắc chắn' },
      { type: 'p', text: 'Sự thật: Xét nghiệm ADN cha – con có độ chính xác ngang với mẹ – con, không phụ thuộc vào giới tính.' },
      { type: 'highlight', text: 'Dẫn chứng: Một xét nghiệm với tối thiểu 20 loci gen STR trùng khớp giữa cha và con có thể xác định quan hệ huyết thống với độ chính xác lên đến 99,9999%, đủ giá trị pháp lý để làm khai sinh, nhận con, phân chia thừa kế…' },
      { type: 'h3', text: '4. Kết quả xét nghiệm ADN có thể thay đổi theo thời gian' },
      { type: 'p', text: 'Sự thật: ADN của một người là bản đồ di truyền cố định từ khi sinh ra cho đến lúc mất, không thay đổi theo thời gian hay môi trường sống (ngoại trừ đột biến cực hiếm).' },
      { type: 'highlight', text: 'Dẫn chứng: Theo Tổ chức Y tế Thế giới (WHO), ADN chỉ thay đổi trong các trường hợp như ghép tủy xương, cấy ghép nội tạng hoặc đột biến gen do bệnh lý như ung thư. Tuy nhiên, đó là những trường hợp cực kỳ hiếm.' },
      { type: 'h3', text: '5. Xét nghiệm ADN có thể xác định được toàn bộ sức khỏe tương lai' },
      { type: 'p', text: 'Sự thật: ADN chỉ giúp phát hiện nguy cơ di truyền một số bệnh nhất định, không thể tiên đoán toàn bộ bệnh tật hay tuổi thọ.' },
      { type: 'highlight', text: 'Dẫn chứng: Ví dụ, gen BRCA1/BRCA2 giúp xác định nguy cơ ung thư vú và buồng trứng, nhưng không khẳng định chắc chắn người mang gen sẽ bị bệnh. Yếu tố môi trường, lối sống, chế độ ăn uống mới là phần lớn quyết định kết quả.' },
      { type: 'h3', text: '6. Xét nghiệm ADN rất phức tạp và tốn kém' },
      { type: 'p', text: 'Sự thật: Xét nghiệm ADN ngày nay đã được đơn giản hóa và phổ cập, với giá thành ngày càng hợp lý.' },
      { type: 'highlight', text: 'Dẫn chứng: Tại Việt Nam, một xét nghiệm huyết thống cha – con hiện nay chỉ từ 2–3 triệu đồng, thời gian trả kết quả từ 4 giờ đến 5 ngày, có thể làm tại nhà với bộ kit lấy mẫu.' },
      { type: 'h3', text: '7. Xét nghiệm ADN sẽ làm lộ thông tin cá nhân cho người khác' },
      { type: 'p', text: 'Sự thật: Các trung tâm uy tín luôn cam kết bảo mật tuyệt đối thông tin ADN theo luật pháp.' },
      { type: 'highlight', text: 'Dẫn chứng: Luật Bảo vệ dữ liệu cá nhân tại Việt Nam (Nghị định 13/2023/NĐ-CP) quy định rõ, thông tin di truyền thuộc dữ liệu nhạy cảm, mọi hành vi rò rỉ, mua bán, sử dụng sai mục đích có thể bị xử phạt hoặc truy cứu trách nhiệm hình sự.' },
      { type: 'h3', text: 'Kết luận' },
      { type: 'p', text: 'Việc hiểu đúng về xét nghiệm ADN là vô cùng quan trọng để người dân có thể tiếp cận công nghệ này một cách chính xác, hợp pháp và hiệu quả. Những lầm tưởng phổ biến không chỉ gây hoang mang mà còn khiến nhiều người bỏ lỡ cơ hội sử dụng công cụ xét nghiệm này để bảo vệ quyền lợi hoặc sức khỏe của bản thân và gia đình.' },
    ]
  },
  {
    slug: '4',
    title: 'Xét nghiệm ADN cho trẻ sơ sinh: Khi nào cần thiết?',
    image: '/blog4.jpg',
    author: 'Dr. Phạm Thị D',
    date: '2024-05-07',
    content: [
      { type: 'p', text: 'Xét nghiệm ADN cho trẻ sơ sinh là một thủ tục y khoa hiện đại đang ngày càng được quan tâm tại Việt Nam cũng như trên thế giới. Việc phân tích ADN từ khi bé mới chào đời có thể giúp phát hiện sớm các vấn đề di truyền hoặc xác minh huyết thống khi cần thiết. Tuy nhiên, không phải lúc nào xét nghiệm cũng là bắt buộc. Dưới đây là các trường hợp cần thiết và có căn cứ y khoa hoặc pháp lý rõ ràng:' },
      { type: 'h3', text: '1. Xác minh quan hệ huyết thống (cha – con, mẹ – con)' },
      { type: 'p', text: 'Khi cần thiết:' },
      { type: 'ul', items: [
        'Không chắc chắn về quan hệ huyết thống giữa trẻ và cha/mẹ.',
        'Tranh chấp quyền nuôi con, thừa kế tài sản, nhận con ngoài giá thú.',
        'Làm khai sinh cho trẻ trong trường hợp cha mẹ không đăng ký kết hôn.'
      ]},
      { type: 'highlight', text: 'Dẫn chứng: Theo Thông tư 04/2020/TT-BTP của Bộ Tư pháp, trong trường hợp không có giấy tờ chứng minh quan hệ huyết thống cha – con, người cha cần xét nghiệm ADN để làm khai sinh cho con.' },
      { type: 'h3', text: '2. Phát hiện sớm bệnh lý di truyền bẩm sinh' },
      { type: 'p', text: 'Khi cần thiết:' },
      { type: 'ul', items: [
        'Gia đình có tiền sử bệnh di truyền như: tan máu bẩm sinh (Thalassemia), phenylketon niệu (PKU), suy giáp bẩm sinh, thiếu men G6PD...',
        'Trẻ sinh ra có dấu hiệu bất thường như vàng da kéo dài, co giật, chậm phát triển, dị tật bẩm sinh.'
      ]},
      { type: 'highlight', text: 'Dẫn chứng: Theo Bộ Y tế Việt Nam (2018), mỗi năm ước tính có 1.500 – 2.000 trẻ em sinh ra bị bệnh Thalassemia. Xét nghiệm ADN giúp phát hiện gen bệnh từ sớm để can thiệp kịp thời, tránh biến chứng nặng nề sau này.' },
      { type: 'h3', text: '3. Sàng lọc sơ sinh mở rộng' },
      { type: 'p', text: 'Khi cần thiết:' },
      { type: 'ul', items: [
        'Áp dụng cho mọi trẻ, đặc biệt trong 3–7 ngày đầu sau sinh.',
        'Tùy bệnh viện hoặc trung tâm xét nghiệm, có thể mở rộng ra 5–75 bệnh di truyền nguy hiểm.'
      ]},
      { type: 'highlight', text: 'Dẫn chứng: Chương trình sàng lọc sơ sinh quốc gia hiện nay tại Việt Nam đã áp dụng cho hơn 60% số trẻ sinh ra, phát hiện sớm các bệnh như: suy giáp bẩm sinh, tăng sản tuyến thượng thận, rối loạn chuyển hóa acid amin...' },
      { type: 'h3', text: '4. Hỗ trợ pháp lý (nhận con, tranh chấp nuôi con, xuất nhập cảnh)' },
      { type: 'p', text: 'Khi cần thiết:' },
      { type: 'ul', items: [
        'Người cha/người mẹ muốn làm thủ tục nhận con hợp pháp tại tòa án hoặc phòng hộ tịch.',
        'Hồ sơ bảo lãnh định cư, di trú, làm quốc tịch tại các nước yêu cầu bằng chứng ADN huyết thống.'
      ]},
      { type: 'highlight', text: 'Dẫn chứng: Theo Cục Hộ tịch, Quốc tịch, Chứng thực, năm 2022 có hàng nghìn trường hợp người nước ngoài hoặc Việt kiều phải thực hiện xét nghiệm ADN cha – con sơ sinh để làm thủ tục bảo lãnh con sang Mỹ, Canada, Đức...' },
      { type: 'h3', text: '5. Trường hợp đặc biệt: Nhầm con trong bệnh viện' },
      { type: 'p', text: 'Khi cần thiết:' },
      { type: 'ul', items: [
        'Có nghi ngờ về việc nhầm lẫn trẻ sơ sinh do giao con sai trong bệnh viện.',
        'Dấu hiệu: Bé có đặc điểm di truyền khác biệt với cả cha và mẹ.'
      ]},
      { type: 'highlight', text: 'Dẫn chứng: Một vụ việc nổi tiếng năm 2012 ở Hà Nội, hai bé sơ sinh bị trao nhầm sau khi sinh, và chỉ đến năm 2018 mới được phát hiện nhờ xét nghiệm ADN do nghi ngờ từ ngoại hình. Sau đó, hai gia đình đã đoàn tụ nhờ kết quả xét nghiệm khẳng định chính xác.' },
      { type: 'h3', text: 'Phương pháp lấy mẫu cho trẻ sơ sinh' },
      { type: 'p', text: 'Mẫu phổ biến: Niêm mạc miệng, mẫu máu gót chân, cuống rốn, tóc có chân tóc.' },
      { type: 'p', text: 'Không gây đau hoặc ảnh hưởng đến sức khỏe nếu lấy mẫu đúng quy chuẩn.' },
      { type: 'p', text: 'Các trung tâm uy tín như GENTIS, Gene Solutions, Bệnh viện Nhi Trung ương đều có dịch vụ xét nghiệm ADN an toàn cho trẻ sơ sinh.' },
      { type: 'h3', text: 'Kết luận' },
      { type: 'p', text: 'Xét nghiệm ADN cho trẻ sơ sinh không phải là điều bắt buộc với mọi bé, nhưng lại rất cần thiết trong các trường hợp xác định huyết thống, sàng lọc bệnh di truyền, hoặc phục vụ mục đích pháp lý. Việc thực hiện sớm giúp cha mẹ có định hướng chăm sóc y tế phù hợp, bảo vệ quyền lợi pháp lý cho trẻ và gia đình, cũng như phát hiện kịp thời những rủi ro di truyền có thể ảnh hưởng lâu dài đến cuộc sống của bé.' },
    ]
  },
  {
    slug: '5',
    title: 'Bảo mật thông tin trong xét nghiệm ADN',
    image: '/blog5.jpg',
    author: 'Dr. Nguyễn Văn E',
    date: '2024-05-10',
    content: [
      { type: 'p', text: '— Vấn đề đạo đức, pháp lý và quyền riêng tư cá nhân —' },
      { type: 'p', text: 'Xét nghiệm ADN không chỉ là một thủ tục y khoa thông thường mà còn là một hành động liên quan trực tiếp đến thông tin di truyền, danh tính, quan hệ huyết thống và sức khỏe cá nhân. Chính vì vậy, bảo mật thông tin trong xét nghiệm ADN là yếu tố then chốt để bảo vệ quyền riêng tư và tránh các rủi ro về pháp lý, đạo đức.' },
      { type: 'h3', text: '1. Tại sao bảo mật thông tin ADN lại quan trọng?' },
      { type: 'p', text: 'ADN là dữ liệu định danh sinh học duy nhất, không thể thay đổi như số điện thoại hay email.' },
      { type: 'p', text: 'Xâm phạm dữ liệu ADN có thể dẫn đến:' },
      { type: 'ul', items: [
        'Lộ quan hệ huyết thống bí mật (ngoài giá thú, nhận con nuôi…).',
        'Phân biệt đối xử trong bảo hiểm, việc làm do tiền sử di truyền.',
        'Lạm dụng thông tin cho mục đích hình sự, thương mại hóa (bán dữ liệu gen).'
      ]},
      { type: 'h3', text: '2. Quy định pháp lý về bảo mật dữ liệu ADN' },
      { type: 'h4', text: 'Tại Việt Nam' },
      { type: 'highlight', text: 'Nghị định 13/2023/NĐ-CP của Chính phủ (có hiệu lực từ 01/7/2023):\n- Xác định thông tin di truyền là dữ liệu cá nhân nhạy cảm.\n- Cấm thu thập, chia sẻ, tiết lộ, mua bán dữ liệu di truyền nếu không được sự đồng ý rõ ràng của chủ thể dữ liệu.\n- Vi phạm có thể bị xử phạt hành chính đến 100 triệu đồng hoặc truy cứu trách nhiệm hình sự nếu gây hậu quả nghiêm trọng.' },
      { type: 'h4', text: 'Quốc tế' },
      { type: 'highlight', text: 'GDPR (Châu Âu): Xếp ADN vào nhóm dữ liệu sinh trắc học, nghiêm cấm sử dụng mà không có sự cho phép rõ ràng.\nHIPAA (Hoa Kỳ): Cấm các công ty bảo hiểm sử dụng dữ liệu di truyền để từ chối hoặc tăng phí bảo hiểm y tế.' },
      { type: 'h3', text: '3. Biện pháp bảo mật tại các trung tâm xét nghiệm uy tín' },
      { type: 'ul', items: [
        'Mã hóa thông tin khách hàng bằng mã số thay vì tên thật.',
        'Chỉ trả kết quả cho người đăng ký, yêu cầu CMND/CCCD đối chiếu.',
        'Không lưu mẫu sinh phẩm và kết quả quá thời gian quy định (thường 30 ngày).',
        'Hệ thống bảo mật đạt tiêu chuẩn ISO 27001 (an ninh thông tin).',
        'Cam kết pháp lý bằng văn bản: GENTIS, MEDLATEC, Gene Solutions… đều yêu cầu khách hàng ký đơn xác nhận đồng ý sử dụng thông tin và cam kết không tiết lộ.'
      ]},
      { type: 'h3', text: '4. Trách nhiệm của người sử dụng dịch vụ' },
      { type: 'ul', items: [
        'Không chia sẻ kết quả ADN cho bên thứ ba nếu không cần thiết.',
        'Không tự ý thực hiện xét nghiệm ADN người khác nếu không có sự đồng ý (trừ trường hợp cơ quan điều tra có lệnh).',
        'Lựa chọn đơn vị có giấy phép của Bộ Y tế và đạt chuẩn ISO, tránh dùng dịch vụ trôi nổi online.'
      ]},
      { type: 'h3', text: '5. Trường hợp thực tế vi phạm bảo mật ADN' },
      { type: 'p', text: 'Năm 2021, tại Trung Quốc, một số công ty xét nghiệm ADN bị điều tra vì thu thập mẫu của hàng triệu người dân, bao gồm cả trẻ em, mà không có sự đồng ý hợp pháp, sau đó chia sẻ dữ liệu cho tổ chức nước ngoài.' },
      { type: 'p', text: 'Tại Mỹ, scandal của công ty 23andMe khiến hàng triệu khách hàng bị rò rỉ dữ liệu gen sau cuộc tấn công mạng năm 2023, dẫn đến lo ngại nghiêm trọng về quyền riêng tư.' },
      { type: 'h3', text: 'Kết luận' },
      { type: 'p', text: 'Bảo mật thông tin trong xét nghiệm ADN không chỉ là nghĩa vụ của trung tâm xét nghiệm mà còn là quyền được pháp luật bảo vệ của mỗi cá nhân. Khi công nghệ sinh học phát triển, dữ liệu di truyền cần được đối xử như "tài sản nhạy cảm cấp cao" nhằm tránh hậu quả đạo đức, pháp lý và xã hội về sau. Việc xét nghiệm ADN phải đi kèm quy trình bảo mật nghiêm ngặt để đảm bảo người dân được tiếp cận dịch vụ một cách an toàn, minh bạch và đúng luật.' },
    ]
  },
  {
    slug: '6',
    title: 'So sánh các phương pháp xét nghiệm ADN hiện nay',
    image: '/blog6.jpg',
    author: 'Dr. Lê Thị F',
    date: '2024-05-15',
    content: [
      { type: 'p', text: '— Ưu nhược điểm, ứng dụng và độ chính xác —' },
      { type: 'p', text: 'Xét nghiệm ADN là công nghệ phân tích thông tin di truyền nhằm phục vụ nhiều mục đích: xác minh huyết thống, phát hiện bệnh lý di truyền, định danh cá thể hay nghiên cứu y học. Hiện nay, có nhiều phương pháp xét nghiệm ADN khác nhau, mỗi phương pháp phù hợp với mục đích và điều kiện sử dụng riêng. Dưới đây là bảng so sánh chi tiết và dẫn chứng cụ thể cho từng kỹ thuật.' },
      { type: 'h3', text: '1. Xét nghiệm ADN bằng STR (Short Tandem Repeats)' },
      { type: 'table', headers: ['Đặc điểm', 'Nội dung'], rows: [
        ['Cách thực hiện', 'Phân tích các đoạn ADN lặp lại ngắn trong vùng không mã hóa.'],
        ['Ứng dụng chính', 'Xét nghiệm huyết thống cha – con, mẹ – con; giám định pháp y.'],
        ['Ưu điểm', 'Độ chính xác cao (99,9999%)\nPhổ biến và được chấp nhận tại tòa án, hộ tịch.\nMẫu dễ lấy: niêm mạc miệng, tóc, móng, máu…'],
        ['Nhược điểm', 'Không cung cấp thông tin về bệnh lý.\nChỉ dùng cho mục đích xác định danh tính.'],
        ['Dẫn chứng', 'Theo chuẩn CODIS của FBI (Hoa Kỳ), phân tích 20 loci STR là đủ để xác định huyết thống hoặc định danh cá thể trong pháp y.']
      ]},
      { type: 'h3', text: '2. Xét nghiệm ADN bằng SNP (Single Nucleotide Polymorphism)' },
      { type: 'table', headers: ['Đặc điểm', 'Nội dung'], rows: [
        ['Cách thực hiện', 'Phân tích hàng triệu điểm biến dị đơn nucleotide (SNP) trong hệ gen.'],
        ['Ứng dụng chính', 'Sàng lọc nguy cơ bệnh di truyền, phân tích tổ tiên, di truyền học cá thể.'],
        ['Ưu điểm', 'Có thể phát hiện hàng trăm bệnh lý tiềm ẩn (ung thư, tim mạch, chuyển hóa...)\nXác định tổ tiên, nguồn gốc di truyền theo % vùng địa lý.\nTăng độ chính xác trong phân tích phức tạp.'],
        ['Nhược điểm', 'Đắt hơn (thường 3–10 triệu/lần).\nKhông phù hợp cho xác định huyết thống pháp lý.'],
        ['Dẫn chứng', 'Các công ty như 23andMe, AncestryDNA dùng SNP để phân tích gen trên hàng triệu người và trả kết quả tổ tiên hoặc bệnh lý tiềm năng.']
      ]},
      { type: 'h3', text: '3. Giải trình tự toàn bộ gen (Whole Genome Sequencing – WGS)' },
      { type: 'table', headers: ['Đặc điểm', 'Nội dung'], rows: [
        ['Cách thực hiện', 'Đọc toàn bộ trình tự 3,2 tỷ cặp base ADN của người.'],
        ['Ứng dụng chính', 'Nghiên cứu chuyên sâu, phát hiện đột biến hiếm, y học cá thể hóa.'],
        ['Ưu điểm', 'Bao phủ toàn bộ hệ gen, không bỏ sót đột biến hiếm.\nPhân tích sâu về các bệnh lý phức tạp, ung thư, rối loạn hiếm.\nỨng dụng cho cá thể hóa điều trị (Precision Medicine).'],
        ['Nhược điểm', 'Rất đắt (15–30 triệu/lần).\nDữ liệu lớn, cần thời gian xử lý và lưu trữ cao.\nKhông phù hợp cho mục đích pháp lý hay huyết thống thông thường.'],
        ['Dẫn chứng', 'Các trung tâm nghiên cứu như Broad Institute hay Illumina dùng WGS để phát hiện đột biến hiếm trong ung thư, Alzheimer, tự kỷ…']
      ]},
      { type: 'h3', text: '4. Xét nghiệm ADN ty thể (mtDNA)' },
      { type: 'table', headers: ['Đặc điểm', 'Nội dung'], rows: [
        ['Cách thực hiện', 'Phân tích gen trong ty thể, chỉ truyền theo dòng mẹ.'],
        ['Ứng dụng chính', 'Truy tìm quan hệ dòng mẹ, nghiên cứu tổ tiên, định danh hài cốt cũ.'],
        ['Ưu điểm', 'Có thể dùng mẫu xương, răng, tóc cổ.\nXác định huyết thống dòng mẹ qua nhiều thế hệ.'],
        ['Nhược điểm', 'Không xác định được quan hệ cha – con.\nĐộ phân giải thấp hơn SNP hoặc STR.'],
        ['Dẫn chứng', 'Trong vụ xác minh hài cốt Sa hoàng Nicholas II của Nga, các nhà khoa học dùng ADN ty thể từ xương để xác định danh tính thành công.']
      ]},
      { type: 'h3', text: '5. Xét nghiệm microarray (Gene chip)' },
      { type: 'table', headers: ['Đặc điểm', 'Nội dung'], rows: [
        ['Cách thực hiện', 'Sử dụng chip gen để so sánh hàng ngàn điểm SNP hoặc vùng gen.'],
        ['Ứng dụng chính', 'Phân tích đa gen bệnh lý, dược lý học di truyền.'],
        ['Ưu điểm', 'Phát hiện các bệnh di truyền phổ biến.\nĐược ứng dụng trong tư vấn dinh dưỡng, thể thao, thuốc phù hợp.'],
        ['Nhược điểm', 'Không toàn diện như WGS.\nChỉ phát hiện các biến dị đã biết, không phát hiện đột biến hiếm.'],
        ['Dẫn chứng', 'Nhiều công ty Việt Nam như Genetica, Gene Solutions đang sử dụng công nghệ microarray để phân tích dinh dưỡng, trí tuệ, khả năng vận động ở trẻ nhỏ.']
      ]},
      { type: 'h3', text: 'Tổng kết so sánh' },
      { type: 'table', headers: ['Phương pháp', 'Mục đích chính', 'Độ chính xác', 'Chi phí (VNĐ)', 'Thời gian trả kết quả'], rows: [
        ['STR', 'Huyết thống, pháp lý', '★★★★★', '2 – 5 triệu', '1 – 3 ngày'],
        ['SNP', 'Bệnh di truyền, tổ tiên', '★★★★☆', '3 – 10 triệu', '7 – 14 ngày'],
        ['WGS', 'Toàn diện & nghiên cứu', '★★★★★+', '15 – 30 triệu', '14 – 30 ngày'],
        ['mtDNA', 'Dòng mẹ, hài cốt cũ', '★★☆☆☆', '4 – 8 triệu', '5 – 10 ngày'],
        ['Microarray', 'Tư vấn gene phổ biến', '★★★☆☆', '3 – 8 triệu', '7 – 10 ngày']
      ]},
      { type: 'h3', text: 'Kết luận' },
      { type: 'p', text: 'Không có phương pháp nào "tốt nhất" một cách tuyệt đối. Việc chọn loại xét nghiệm ADN phù hợp phụ thuộc vào mục đích sử dụng, chi phí, và mức độ chính xác mong muốn. Nếu bạn cần xác minh huyết thống nhanh và có giá trị pháp lý, hãy chọn STR. Nếu quan tâm đến sức khỏe di truyền lâu dài, hãy cân nhắc SNP hoặc WGS. Hãy luôn thực hiện tại các trung tâm uy tín, có cấp phép của Bộ Y tế để đảm bảo độ chính xác và bảo mật.' },
    ]
  },
];

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    let loaded = getBlogs();
    if (!loaded || loaded.length === 0) {
      // Nếu localStorage rỗng, reset về mock data
      resetBlogs(mockBlogPosts);
      loaded = mockBlogPosts;
    }
    setBlogs(loaded);
  }, []);

  // Nếu không có slug, show blog list
  if (!slug) {
    return (
      <>
        <Header />
        <main className="blogpost-bg">
          <div className="blogpost-container">
            <h1 className="blogpost-title">Tin Tức & Bài Viết</h1>
            <div className="blog-grid">
              {blogs.map((post, idx) => (
                <article className="blog-card" key={post.id || idx}>
                  <div className="blog-img-wrap">
                    <img src={post.image} alt={post.title} className="blog-img" />
                  </div>
                  <div className="blog-content">
                    <h3 className="blog-card-title">{post.title}</h3>
                    <p className="blog-desc">{(post.content && typeof post.content === 'string') ? post.content.substring(0, 150) : ''}...</p>
                    <button 
                      onClick={() => navigate(`/blog/${post.id || post.slug}`)} 
                      className="blog-btn"
                    >
                      Đọc tiếp
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </main>
        <footer className="member-footer">
          <div className="member-footer-content">
            <div className="member-footer-info">
              <div><strong>Số Hotline:</strong> 1800.9999</div>
              <div><strong>Email:</strong> trungtamxetnghiem@gmail.com</div>
              <div><strong>Địa chỉ:</strong> 643 Điện Biên Phủ, Phường 1, Quận 3, TPHCM</div>
            </div>
            <div className="member-footer-map">
              <iframe
                title="Bản đồ Trung tâm xét nghiệm ADN"
                src="https://www.google.com/maps?q=643+Điện+Biên+Phủ,+Phường+1,+Quận+3,+TPHCM&output=embed"
                width="250"
                height="140"
                style={{ border: 0, borderRadius: 10 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </footer>
      </>
    );
  }

  // Nếu slug tồn tại, show blog chi tiết
  const post = blogs.find((b) => (b.id && b.id.toString() === slug) || b.slug === slug);

  if (!post) {
    return (
      <>
        <Header />
        <div className="blogpost-notfound">
          <h2>Bài viết không tồn tại</h2>
          <button onClick={() => navigate('/blog')} className="blogpost-back-btn">Quay lại danh sách</button>
        </div>
        <footer className="member-footer">
          <div className="member-footer-content">
            <div className="member-footer-info">
              <div><strong>Số Hotline:</strong> 1800.9999</div>
              <div><strong>Email:</strong> trungtamxetnghiem@gmail.com</div>
              <div><strong>Địa chỉ:</strong> 643 Điện Biên Phủ, Phường 1, Quận 3, TPHCM</div>
            </div>
            <div className="member-footer-map">
              <iframe
                title="Bản đồ Trung tâm xét nghiệm ADN"
                src="https://www.google.com/maps?q=643+Điện+Biên+Phủ,+Phường+1,+Quận+3,+TPHCM&output=embed"
                width="250"
                height="140"
                style={{ border: 0, borderRadius: 10 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </footer>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="blogpost-bg">
        <div className="blogpost-container">
          <div className="blogpost-featured-img-wrap">
            <img src={post.image} alt={post.title} className="blogpost-featured-img" />
          </div>
          <h1 className="blogpost-title">{post.title}</h1>
          <div className="blogpost-meta">
            <span className="blogpost-author">{post.author}</span>
            <span className="blogpost-date">{post.createdAt || (post.date ? new Date(post.date).toLocaleDateString('vi-VN') : '')}</span>
          </div>
          <div className="blogpost-content">
            {Array.isArray(post.content)
              ? post.content.map((block, idx) => {
                  if (block.type === 'h3') return <h3 key={idx}>{block.text}</h3>;
                  if (block.type === 'h4') return <h4 key={idx}>{block.text}</h4>;
                  if (block.type === 'p') return <p key={idx}>{block.text}</p>;
                  if (block.type === 'highlight') return <div key={idx} style={{background:'#e3f0ff',padding:'10px 16px',borderRadius:8,margin:'12px 0',color:'#2979ff'}}><strong>{block.text}</strong></div>;
                  if (block.type === 'ul' && Array.isArray(block.items)) return <ul key={idx}>{block.items.map((item,i)=><li key={i}>{item}</li>)}</ul>;
                  if (block.type === 'table' && Array.isArray(block.headers) && Array.isArray(block.rows)) return (
                    <table key={idx} className="blogpost-table"><thead><tr>{block.headers.map((h,i)=><th key={i}>{h}</th>)}</tr></thead><tbody>{block.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table>
                  );
                  return null;
                })
              : (post.content && typeof post.content === 'string')
                ? <div style={{whiteSpace: 'pre-line'}}>{post.content}</div>
                : null}
          </div>
        </div>
      </main>
      <footer className="member-footer">
        <div className="member-footer-content">
          <div className="member-footer-info">
            <div><strong>Số Hotline:</strong> 1800.9999</div>
            <div><strong>Email:</strong> trungtamxetnghiem@gmail.com</div>
            <div><strong>Địa chỉ:</strong> 643 Điện Biên Phủ, Phường 1, Quận 3, TPHCM</div>
          </div>
          <div className="member-footer-map">
            <iframe
              title="Bản đồ Trung tâm xét nghiệm ADN"
              src="https://www.google.com/maps?q=643+Điện+Biên+Phủ,+Phường+1,+Quận+3,+TPHCM&output=embed"
              width="250"
              height="140"
              style={{ border: 0, borderRadius: 10 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </footer>
    </>
  );
};

export default BlogPostPage; 