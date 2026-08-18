alter table public.posts
  add column if not exists like_count_base integer not null default 0
  check (like_count_base >= 0);

with featured_post as (
  select id
  from public.posts
  where published = true
  order by created_at desc
  limit 1
),
actual_likes as (
  select featured_post.id, count(post_likes.id)::integer as count
  from featured_post
  left join public.post_likes on post_likes.post_id = featured_post.id
  group by featured_post.id
)
update public.posts
set like_count_base = greatest(3734 - actual_likes.count, 0)
from actual_likes
where public.posts.id = actual_likes.id;
