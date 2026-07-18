-- Demo seed for the impact dashboard: 10 sample profiles (7 with CVs, 3 mid-flow)
-- across a realistic spread of trades. Idempotent — clears prior seed rows first.
-- Run in the Supabase SQL editor, or via the MCP execute_sql tool.

delete from public.users where whatsapp_number like 'whatsapp:+9715000000%';

with ins_users as (
  insert into public.users (whatsapp_number, display_name, state, created_at) values
    ('whatsapp:+971500000001','Fatima','cv_sent',           now() - interval '2 hours'),
    ('whatsapp:+971500000002','Amina','cv_sent',            now() - interval '5 hours'),
    ('whatsapp:+971500000003','Grace','cv_sent',            now() - interval '8 hours'),
    ('whatsapp:+971500000004','Mohammed','cv_sent',         now() - interval '1 day'),
    ('whatsapp:+971500000005','Rajesh','cv_sent',           now() - interval '1 day 4 hours'),
    ('whatsapp:+971500000006','Layla','cv_sent',            now() - interval '2 days'),
    ('whatsapp:+971500000007','Samuel','cv_sent',           now() - interval '3 days'),
    ('whatsapp:+971500000008','Maria','profile_complete',   now() - interval '1 hour'),
    ('whatsapp:+971500000009','Ahmed','interviewing',       now() - interval '30 minutes'),
    ('whatsapp:+971500000010','Joseph','interviewing',      now() - interval '10 minutes')
  returning id, whatsapp_number, created_at
)
insert into public.profiles (user_id, full_name, role_trade, employers, skills, tools, achievement, cv_pdf_path, created_at)
select u.id, v.full_name, v.role_trade, v.employers::jsonb, v.skills::jsonb, v.tools::jsonb, v.achievement, v.cv_path, u.created_at
from ins_users u
join (values
  ('whatsapp:+971500000001','Fatima Hassan','Housekeeper',   '[{"name":"Al-Rashid Family","duration":"5 years"}]','["Childcare","Deep cleaning","Cooking"]','["Vacuum","Steam cleaner"]','Managed a household of six for five years.','seed/1/cv.pdf'),
  ('whatsapp:+971500000002','Amina Yusuf','Housekeeper',      '[{"name":"Al-Fahim Household","duration":"3 years"}]','["Cleaning","Laundry","Ironing"]','["Washing machine"]','Trusted with the keys to the family home.','seed/2/cv.pdf'),
  ('whatsapp:+971500000003','Grace Okoro','Nanny',            '[{"name":"Private family - Dubai","duration":"4 years"}]','["Childcare","Cooking","First aid"]','[]','Cared for newborn twins from birth.','seed/3/cv.pdf'),
  ('whatsapp:+971500000004','Mohammed Aslam','Driver',        '[{"name":"Gulf Logistics","duration":"6 years"}]','["Safe driving","Navigation","Punctuality"]','["GPS"]','200,000 km driven with zero accidents.','seed/4/cv.pdf'),
  ('whatsapp:+971500000005','Rajesh Kumar','Driver',          '[{"name":"City Taxi","duration":"3 years"}]','["City routes","Customer service"]','["Meter"]','Top-rated driver two years running.','seed/5/cv.pdf'),
  ('whatsapp:+971500000006','Layla Mansour','Hairdresser',    '[{"name":"Rose Salon","duration":"4 years"}]','["Hair styling","Coloring","Bridal"]','["Scissors","Dryer"]','Built a loyal client base of over 100.','seed/6/cv.pdf'),
  ('whatsapp:+971500000007','Samuel Tesfaye','Electrician',   '[{"name":"BuildRight Contracting","duration":"7 years"}]','["Wiring","Maintenance","Safety"]','["Multimeter","Drill"]','Wired more than 30 villas.','seed/7/cv.pdf'),
  ('whatsapp:+971500000008','Maria Santos','Cook',            '[{"name":"Private family","duration":"5 years"}]','["Arabic cuisine","Baking","Meal prep"]','["Oven"]','Cooked for events of 50 guests.',null),
  ('whatsapp:+971500000009','Ahmed Ali','Security Guard',     '[]','["Vigilance"]','[]',null,null),
  ('whatsapp:+971500000010','Joseph Mwangi','Gardener',       '[]','["Planting"]','[]',null,null)
) as v(wa, full_name, role_trade, employers, skills, tools, achievement, cv_path)
on u.whatsapp_number = v.wa;
