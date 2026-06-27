-- Sample products for hvving. Run AFTER schema.sql in the Supabase SQL editor.
-- Images are served from /public (no Supabase Storage needed for these).
-- Prices/stock are placeholders — edit them in /admin/products.

insert into public.products (slug, name, price_krw, short_description, description_html, stock, thumbnail_url, is_published, is_set)
values
  ('cd', 'hvving — CD', 25000, '한정반 CD / 피쉬본 참 포함', '<p>hvving 의 한정반 CD. 케이스 내부 아트워크 포함.</p>', 30, '/images/products/cd-front.png', true, false),
  ('fishbone-keyring', 'Fishbone Keyring', 18000, '메탈 피쉬본 키링', '<p>hvving 시그니처 피쉬본 키링. 메탈 소재.</p>', 50, '/images/products/fishbone-keyring.png', true, false),
  ('cap', 'Cap', 45000, '체인 디테일 캡', '<p>패치 + 체인 디테일이 있는 캡.</p>', 20, '/images/products/cap.png', true, false),
  ('bandana', 'Bandana', 30000, '스파이더웹 프린트 반다나', '<p>고딕 스파이더웹 프린트 반다나.</p>', 25, '/images/products/bandana.png', true, false)
on conflict (slug) do nothing;

-- CD 내부 아트워크를 추가 이미지로 등록
insert into public.product_images (product_id, url, alt, position)
select p.id, '/images/products/cd-inside.png', 'CD 내부 아트워크', 1
from public.products p
where p.slug = 'cd'
  and not exists (
    select 1 from public.product_images pi
    where pi.product_id = p.id and pi.url = '/images/products/cd-inside.png'
  );
