-- 0006_canonical_trades.sql
--
-- Groups free-text trades into canonical occupations.
--
-- role_trade is written by the interviewer from whatever the worker said, so the
-- same job arrives in many forms: "سائق", "سائق خاص", "driver" are one occupation,
-- and "مصممة UX/UI" and "تصميم تجربة المستخدم وأبحاث المستخدم" are another. Left
-- ungrouped, every worker looks like a category of one and the distribution chart
-- says nothing.
--
-- This lives in the database rather than in the page so the landing page, the
-- dashboard and anything built later all group identically.

create or replace function public.canonical_trade(t text)
returns text
language sql
immutable
as $$
  select case
    when x ~ 'سائق|سواق|driver|chauffeur'                       then 'سائقون'
    when x ~ 'توصيل|دليفري|delivery|courier|\mrider\M'          then 'عمال توصيل'
    when x ~ 'طاه|طباخ|طبخ|شيف|chef|\mcook'                     then 'طهاة'
    when x ~ 'خادم|عاملة منزل|عامل منزل|منزلي|مربي|مربّي|حضانة|housekeep|domestic|\mmaid\M|nanny'
                                                                then 'عمالة منزلية ورعاية أطفال'
    when x ~ 'نظاف|تنظيف|\mclean'                               then 'عمال نظافة'
    when x ~ 'كهربائ|كهرباء|electric'                           then 'كهربائيون'
    when x ~ 'سباك|سمكري|plumb'                                 then 'سبّاكون'
    when x ~ 'تكييف|تبريد|\mhvac\M|air condition'               then 'فنيو تكييف وتبريد'
    when x ~ 'نجار|carpent'                                     then 'نجّارون'
    when x ~ 'دهان|صباغ|\mpaint'                                then 'دهّانون'
    when x ~ 'لحام|\mweld'                                      then 'لحّامون'
    when x ~ 'بناء|بلاط|مبان|construct|mason'                   then 'عمال بناء'
    when x ~ 'حلاق|صالون|تجميل|مصفف|barber|salon|beaut'         then 'فنيو صالونات وتجميل'
    when x ~ 'خياط|خيّاط|ترزي|tailor'                           then 'خيّاطون'
    when x ~ 'حارس|حراسة|أمن|امن|security|\mguard'              then 'حراس أمن'
    when x ~ 'بستان|حدائق|زراع|garden|\mfarm'                   then 'بستانيون ومزارعون'
    when x ~ 'مستودع|مخزن|warehouse'                            then 'عمال مستودعات'
    when x ~ 'نادل|ضيافة|مطعم|مقهى|waiter|barista|hospitality'  then 'العاملون في الضيافة'
    when x ~ 'تمريض|ممرض|صيدل|رعاية صحية|\mnurse|pharmac'       then 'الرعاية الصحية'
    when x ~ 'مبيعات|بائع|تجزئة|كاشير|\msales\M|retail|cashier' then 'مبيعات وتجزئة'
    when x ~ 'محاسب|مالية|accountant|financ'                    then 'محاسبون'
    when x ~ 'معلم|مدرس|تعليم|\mteach|tutor'                    then 'معلمون'
    when x ~ '\mux\M|\mui\M|تصميم|مصمم|graphic|\mdesign'        then 'مصممون'
    when x ~ 'بيانات|داتا|\mdata\M|analyt'                      then 'تحليل البيانات'
    when x ~ 'برمج|مطور|شبكات|حاسب|software|develop|network'    then 'تقنية المعلومات'
    when x ~ 'هندس|مهندس|engineer'                              then 'مهندسون'
    else nullif(btrim(t), '')
  end
  from (select lower(btrim(coalesce(t, '')))) as s(x);
$$;

comment on function public.canonical_trade(text) is
  'Maps a free-text role_trade onto a canonical occupation label. Unmatched values fall through unchanged rather than being discarded into an "other" bucket.';

-- Recreate the distribution view on top of the canonical label.
drop view if exists public.dashboard_trade_distribution;
create view public.dashboard_trade_distribution
with (security_invoker = true) as
select t as role_trade, count(*)::int as cnt
from (
  select public.canonical_trade(role_trade) as t
  from public.profiles
  where role_trade is not null and role_trade <> ''
) s
where t is not null
group by t
order by count(*) desc;

grant select on public.dashboard_trade_distribution to anon, authenticated;
