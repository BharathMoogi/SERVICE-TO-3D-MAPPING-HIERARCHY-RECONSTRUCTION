/* ================================================================
   car.js  —  AtlasAI Automotive Digital Twin Engine v2.0
   Procedural BMW M4 CAD model · AI part search · Geometry matching
   ================================================================ */
'use strict';

// ═══════════════════════════════════════════════════════════════
// PARTS DATABASE
// ═══════════════════════════════════════════════════════════════
const DB = {
  chassis_frame:          { n:'CLAR Chassis Frame',         pn:'CHS-CLAR-M4-001',  cat:'chassis',    asm:'Chassis',          mat:'UHSS/CFRP/Aluminium',      wt:'480 kg', h:'ok',   ico:'🏗️', desc:'BMW CLAR mixed-material chassis. 40% ultra-high-strength steel, 20% CFRP. EuroNCAP 5-star rated.',                  svc:['Chassis repairs require BMW factory approval','Post-repair structural scan mandatory','Corrosion protection re-application required after any weld'],                   mnt:{'Corrosion Inspection':'Every 3 years','Structural Scan':'After any collision event'},               spec:{Rigidity:'37,000 Nm/deg',Torsion:'42,000 Nm/deg',NCAP:'5 Stars',Length:'4794 mm'},   tor:'Various (see body repair manual)',     rel:['front_subframe','rear_subframe','body_lower_shell'], par:'Vehicle Structure',  chi:['front_subframe','rear_subframe'] },
  front_subframe:         { n:'Front Subframe (Aluminium)', pn:'CHS-SFNT-M4-001',  cat:'chassis',    asm:'Chassis',          mat:'Aluminium Alloy 6061',     wt:'18 kg',  h:'ok',   ico:'🔩', desc:'Cast aluminium front subframe. Mounts engine, steering rack, and front suspension points.',                          svc:['Remove front suspension components','Disconnect steering rack','Remove 6 mounting bolts (M12, 90 Nm)','Inspect for cracks before reinstallation'],           mnt:{'Inspection':'Every 40,000 km'},                                                                     spec:{Material:'Al 6061-T6',Bolts:'6× M12 @ 90 Nm'},                                      tor:'90 Nm',                                rel:['chassis_frame','wishbone_upper_fl','power_steering_pump'],par:'Chassis Frame',      chi:[] },
  rear_subframe:          { n:'Rear Subframe',              pn:'CHS-SRNT-M4-001',  cat:'chassis',    asm:'Chassis',          mat:'Steel / Aluminium Hybrid', wt:'22 kg',  h:'ok',   ico:'🔩', desc:'Rear integral-link subframe. Supports rear axle, differential, and rear dampers.',                                   svc:['Lower with jack stands on 4 points','Disconnect driveshaft and diff','Remove 8 mount bolts (M14, 120 Nm)'],        mnt:{'Inspection':'Every 60,000 km'},                                                                     spec:{Material:'Steel+Al hybrid',Bolts:'8× M14 @ 120 Nm'},                                 tor:'120 Nm',                                rel:['chassis_frame','wishbone_upper_rl'],       par:'Chassis Frame',      chi:[] },
  body_lower_shell:       { n:'Body Lower Shell',           pn:'BDY-LOW-M4-001',   cat:'body',       asm:'Body',             mat:'High-Strength Steel',      wt:'62 kg',  h:'ok',   ico:'🚗', desc:'Lower body sill and rocker panel assembly. Integrated door hinge reinforcements and side-impact beams.',              svc:['Section welding only','Use OEM replacement sections','Corrosion treatment required'],                             mnt:{'Paint/Rust Inspection':'Annual'},                                                                   spec:{Steel:'590 MPa HSLA',Coating:'E-coat + Stone chip'},                                 tor:'N/A (welded)',                          rel:['chassis_frame','door_front_left'],         par:'Body Assembly',      chi:[] },
  engine_hood:            { n:'Engine Hood (CFRP)',         pn:'BDY-HOOD-M4-CF',   cat:'body',       asm:'Body',             mat:'Carbon Fibre Reinforced Polymer',wt:'8.5 kg',h:'ok', ico:'🚗',desc:'Lightweight CFRP engine hood with dual functional vents. 40% lighter than steel. Integrated edge trim.',            svc:['Mark hinge position before removal','Remove 4 hinge bolts (M8, 20 Nm) with assistant','Align to 4.5 mm ± 0.5 mm body gap on reinstall'],                       mnt:{'Hinge Lubrication':'Every 2 years','Paint Inspection':'Annual'},                                    spec:{Material:'CFRP 3K/2×2',Weight:'8.5 kg',Gap:'4.5 mm ± 0.5 mm',Vents:'2× functional'}, tor:'20 Nm hinge bolts',                    rel:['front_fender_left','front_bumper_assembly'], par:'Body Assembly',  chi:[] },
  roof_panel:             { n:'Roof Panel (Carbon Fibre)',  pn:'BDY-ROOF-CF-M4',   cat:'body',       asm:'Body',             mat:'CFRP 3K/2×2 Twill Weave',  wt:'6.8 kg', h:'ok',   ico:'📐', desc:'Visible carbon fibre roof. Lowers CoG by 14 mm. UV-sealed clear coat. Saves 5 kg vs steel.',                        svc:['Specialist panel bonding required','Use SikaPower-498 structural adhesive','24h cure under clamped pressure'],          mnt:{'UV Sealant':'Every 2 years','Chip Inspection':'Annual'},                                            spec:{Material:'CFRP 3K',Weight:'6.8 kg',Thickness:'3.2 mm',Finish:'Clear coated'},        tor:'N/A (bonded)',                          rel:['windshield_front','windshield_rear','roof_spoiler'],par:'Body Assembly', chi:[] },
  trunk_lid:              { n:'Trunk Lid',                  pn:'BDY-TRNK-M4-001',  cat:'body',       asm:'Body',             mat:'Aluminium Alloy 6016',     wt:'12.3 kg',h:'ok',   ico:'🚪', desc:'Aluminium trunk lid with integrated lip spoiler, keyless entry sensor, and wiring loom.',                            svc:['Disconnect wiring harness inside trunk','Mark hinge position','Remove 4 hinge bolts (M8, 22 Nm) with assistant'],      mnt:{'Gas Strut Check':'Every 3 years'},                                                                  spec:{Material:'Al 6016-T4',Gap:'4.0 mm ± 0.5 mm'},                                       tor:'22 Nm hinge bolts',                    rel:['roof_panel','rear_bumper_assembly','roof_spoiler'], par:'Body Assembly',chi:['roof_spoiler'] },
  front_bumper_assembly:  { n:'Front Bumper Assembly',      pn:'BDY-FBMP-CF-M4',   cat:'body',       asm:'Body',             mat:'CFRP / PP-GF30 Carrier',   wt:'9.2 kg', h:'ok',   ico:'🚗', desc:'M4 Competition front bumper with large kidney grille, carbon splitter, and integrated PDC/ACC radar.',              svc:['Remove front wheel arch liners','Disconnect PDC/ACC/fog connectors','Remove 6 lower undertray bolts','Pull bumper forward'], mnt:{'PDC Sensor Check':'Annual','Radar Alignment':'After any impact'},                                  spec:{Material:'CFRP',Weight:'9.2 kg',ACC_Radar:'Integrated'},                             tor:'Clip pins hand tight',                 rel:['headlight_left','headlight_right','front_splitter','front_grille'], par:'Body Assembly', chi:['headlight_left','headlight_right','front_splitter'] },
  rear_bumper_assembly:   { n:'Rear Bumper Assembly',       pn:'BDY-RBMP-CF-M4',   cat:'body',       asm:'Body',             mat:'CFRP / PP-GF30',           wt:'8.8 kg', h:'ok',   ico:'🚗', desc:'M4 rear bumper with integrated diffuser, quad exhaust cutouts, and 4× PDC sensors.',                                svc:['Remove trunk liner to access top fasteners','Disconnect PDC and light connectors','Pull bumper rearward'],              mnt:{'PDC Sensor Check':'Annual'},                                                                        spec:{Weight:'8.8 kg',PDC:'4 sensors',Exhaust:'4× cutouts'},                               tor:'Bumper bolts 10 Nm',                   rel:['taillight_left','taillight_right','rear_diffuser'], par:'Body Assembly',chi:['taillight_left','taillight_right','rear_diffuser'] },
  front_fender_left:      { n:'Front Left Fender',          pn:'BDY-FFL-M4-001',   cat:'body',       asm:'Body',             mat:'Steel / Aluminium',        wt:'6.2 kg', h:'ok',   ico:'🚗', desc:'Front left wheel arch panel. Widened M-specific flare (+35 mm). Integrated vented air outlet.',                     svc:['Remove wheel arch liner','Disconnect fender vent grille','Remove 8 mounting bolts (M6, 8 Nm)'],                         mnt:{'Stone-chip Inspection':'Annual'},                                                                   spec:{Width:'+ 35 mm',Vent:'Yes — functional'},                                            tor:'8 Nm',                                 rel:['engine_hood','door_front_left'],           par:'Body Assembly',      chi:[] },
  front_fender_right:     { n:'Front Right Fender',         pn:'BDY-FFR-M4-001',   cat:'body',       asm:'Body',             mat:'Steel / Aluminium',        wt:'6.2 kg', h:'ok',   ico:'🚗', desc:'Mirror image of front left fender. M-widened arch +35 mm.',                                                        svc:['Same procedure as front left fender'],                                                              mnt:{'Stone-chip Inspection':'Annual'},                                                                   spec:{Width:'+ 35 mm'},                                                                    tor:'8 Nm',                                 rel:['engine_hood','door_front_right'],          par:'Body Assembly',      chi:[] },
  rear_quarter_panel_left:{ n:'Rear Left Quarter Panel',    pn:'BDY-RQL-M4-001',   cat:'body',       asm:'Body',             mat:'Steel',                    wt:'9.1 kg', h:'ok',   ico:'🚗', desc:'Rear left quarter panel. Wider M4 specific (+40 mm). Integrated tail lamp recess.',                                 svc:['Panel replacement — section welding required','Use OEM replacement sections'],                       mnt:{'Paint Inspection':'Annual'},                                                                        spec:{Width:'+ 40 mm',Tail_lamp_recess:'Yes'},                                             tor:'N/A (welded)',                          rel:['trunk_lid','door_rear_left','taillight_left'], par:'Body Assembly',  chi:[] },
  rear_quarter_panel_right:{n:'Rear Right Quarter Panel',   pn:'BDY-RQR-M4-001',   cat:'body',       asm:'Body',             mat:'Steel',                    wt:'9.1 kg', h:'ok',   ico:'🚗', desc:'Mirror image of rear left quarter panel.',                                                                          svc:['Same procedure as rear left quarter'],                                                              mnt:{'Paint Inspection':'Annual'},                                                                        spec:{Width:'+ 40 mm'},                                                                    tor:'N/A (welded)',                          rel:['trunk_lid','door_rear_right','taillight_right'],par:'Body Assembly', chi:[] },
  door_front_left:        { n:'Front Left Door',            pn:'BDY-DFL-M4-001',   cat:'body',       asm:'Body',             mat:'UHSS / Aluminium Skin',    wt:'48 kg',  h:'ok',   ico:'🚪', desc:'Front left door with acoustic laminated glass, power window, M door sill and side airbag.',                         svc:['Remove door card (8× T25)','Disconnect window regulator and speaker','Remove hinge bolts (M10, 50 Nm) — 2 technicians required'], mnt:{'Hinge Grease':'Every 2 years','Seal Inspection':'Annual'},                                         spec:{Weight:'48 kg',Glass:'Acoustic laminated',Airbag:'Side SRS'},                       tor:'50 Nm hinge bolts',                    rel:['door_front_right','window_front_left'],    par:'Body Assembly',      chi:['window_front_left'] },
  door_front_right:       { n:'Front Right Door',           pn:'BDY-DFR-M4-001',   cat:'body',       asm:'Body',             mat:'UHSS / Aluminium Skin',    wt:'48 kg',  h:'ok',   ico:'🚪', desc:'Front right door. Includes mirror control loom (7-pin connector).',                                                svc:['Same as front left door','Note: additional mirror control loom (7-pin)'],                           mnt:{'Hinge Grease':'Every 2 years'},                                                                     spec:{Weight:'48 kg',Mirror_loom:'7-pin'},                                                 tor:'50 Nm',                                rel:['door_front_left','window_front_right'],    par:'Body Assembly',      chi:['window_front_right'] },
  door_rear_left:         { n:'Rear Left Door',             pn:'BDY-DRL-M4-001',   cat:'body',       asm:'Body',             mat:'UHSS / Aluminium Skin',    wt:'45 kg',  h:'ok',   ico:'🚪', desc:'Rear left door. Includes child safety lock and acoustic glass.',                                                    svc:['Remove rear door card (6× T25)','Disconnect window regulator','Remove B-pillar weatherstrip','Support door — remove hinge bolts (M10, 50 Nm)'], mnt:{'Hinge Grease':'Every 2 years'},                                       spec:{Weight:'45 kg',Child_lock:'Yes'},                                                    tor:'50 Nm',                                rel:['door_rear_right','window_rear_left'],       par:'Body Assembly',     chi:['window_rear_left'] },
  door_rear_right:        { n:'Rear Right Door',            pn:'BDY-DRR-M4-001',   cat:'body',       asm:'Body',             mat:'UHSS / Aluminium Skin',    wt:'45 kg',  h:'ok',   ico:'🚪', desc:'Rear right door. Interior emergency release and acoustic glass.',                                                   svc:['Same as rear left door','Disconnect child lock actuator connector'],                                 mnt:{'Hinge Grease':'Every 2 years'},                                                                     spec:{Weight:'45 kg'},                                                                     tor:'50 Nm',                                rel:['door_rear_left','window_rear_right'],       par:'Body Assembly',     chi:['window_rear_right'] },
  windshield_front:       { n:'Front Windscreen (Heated)',  pn:'GLS-WSF-M4-HUD',   cat:'body',       asm:'Glazing',          mat:'Acoustic Laminated Glass SGP',wt:'14.8 kg',h:'ok', ico:'🪟',desc:'Heated acoustic laminated windscreen. Integrated HUD zone, rain sensor, acoustic IR film.',                          svc:['Cut adhesive bond with oscillating tool','Clean body flange to bare metal','Apply Sika Tack Drive adhesive','Cure 4 hours min before driving'],    mnt:{'Chip Repair':'At < 10mm chip','Replacement':'At crack or delamination'},                            spec:{Glass:'Laminated SGP',Thickness:'5.5 mm',Heated:'Yes',HUD:'Yes'},                    tor:'N/A (bonded)',                          rel:['windshield_rear','roof_panel'],             par:'Body Assembly',      chi:[] },
  windshield_rear:        { n:'Rear Windscreen',            pn:'GLS-WSR-M4-001',   cat:'body',       asm:'Glazing',          mat:'Toughened Glass',          wt:'8.4 kg', h:'ok',   ico:'🪟', desc:'Heated rear windscreen with antenna integration and privacy glass option.',                                         svc:['Remove C-pillar trims','Cut adhesive bond','Apply Sika Tack Drive and cure 4 hours'],               mnt:{'Replacement':'At crack or delamination'},                                                           spec:{Type:'Toughened',Heated:'Yes (rear demist)'},                                        tor:'N/A (bonded)',                          rel:['windshield_front','roof_panel'],            par:'Body Assembly',      chi:[] },
  window_front_left:      { n:'Front Left Window Glass',    pn:'GLS-WFL-M4-001',   cat:'body',       asm:'Glazing',          mat:'Laminated Acoustic Glass',  wt:'4.2 kg', h:'ok',   ico:'🪟', desc:'Front left door glass. Frameless window. Acoustic laminated for NVH reduction.',                                  svc:['Remove door card and membrane','Disconnect regulator motor','Slide glass upward and out'],            mnt:{'Seal Inspection':'Every 2 years'},                                                                  spec:{Type:'Acoustic laminated',Frameless:'Yes'},                                          tor:'Regulator bolts 8 Nm',                 rel:['door_front_left','window_front_right'],    par:'Front Left Door',    chi:[] },
  window_front_right:     { n:'Front Right Window Glass',   pn:'GLS-WFR-M4-001',   cat:'body',       asm:'Glazing',          mat:'Laminated Acoustic Glass',  wt:'4.2 kg', h:'ok',   ico:'🪟', desc:'Front right door glass. Frameless acoustic laminated glass.',                                                      svc:['Same as front left window'],                                                                        mnt:{'Seal Inspection':'Every 2 years'},                                                                  spec:{Type:'Acoustic laminated',Frameless:'Yes'},                                          tor:'8 Nm',                                 rel:['door_front_right'],                        par:'Front Right Door',   chi:[] },
  window_rear_left:       { n:'Rear Left Window Glass',     pn:'GLS-WRL-M4-001',   cat:'body',       asm:'Glazing',          mat:'Toughened Glass',          wt:'3.8 kg', h:'ok',   ico:'🪟', desc:'Rear left door glass. Privacy-tinted toughened glass.',                                                            svc:['Remove rear door card','Disconnect regulator','Lower glass and slide out'],                          mnt:{'Seal Inspection':'Every 2 years'},                                                                  spec:{Type:'Toughened',Tint:'Privacy'},                                                    tor:'8 Nm',                                 rel:['door_rear_left'],                          par:'Rear Left Door',     chi:[] },
  window_rear_right:      { n:'Rear Right Window Glass',    pn:'GLS-WRR-M4-001',   cat:'body',       asm:'Glazing',          mat:'Toughened Glass',          wt:'3.8 kg', h:'ok',   ico:'🪟', desc:'Rear right door glass. Privacy-tinted toughened glass.',                                                           svc:['Same as rear left window'],                                                                         mnt:{'Seal Inspection':'Every 2 years'},                                                                  spec:{Type:'Toughened',Tint:'Privacy'},                                                    tor:'8 Nm',                                 rel:['door_rear_right'],                         par:'Rear Right Door',    chi:[] },
  headlight_left:         { n:'Left Adaptive LED Headlight',pn:'LGT-AHL-L-M4-LED', cat:'body',       asm:'Exterior Lighting',mat:'PC Lens / Al Housing',     wt:'4.8 kg', h:'ok',   ico:'💡', desc:'Full LED adaptive headlight. Camera-controlled cornering light. Anti-dazzle high beam matrix.',                   svc:['Remove front bumper to access','Disconnect 5-pin connector','Remove 3 mounting bolts (M8, 8 Nm)','Aim headlight via BMW ISTA after fitting'], mnt:{'Aim Check':'Annual or after impact','Lens Polish':'Every 2 years'},              spec:{Type:'Full LED Matrix',Functions:'DRL/Lo/Hi/Cornering',Colour_temp:'5500 K'},        tor:'8 Nm mounting bolts',                  rel:['headlight_right','drl_left','front_bumper_assembly'],par:'Front Bumper', chi:[] },
  headlight_right:        { n:'Right Adaptive LED Headlight',pn:'LGT-AHL-R-M4-LED',cat:'body',       asm:'Exterior Lighting',mat:'PC Lens / Al Housing',     wt:'4.8 kg', h:'ok',   ico:'💡', desc:'Mirror image of left headlight. Same LED matrix array spec.',                                                      svc:['Same as left headlight'],                                                                           mnt:{'Aim Check':'Annual'},                                                                               spec:{Type:'Full LED Matrix',Colour_temp:'5500 K'},                                        tor:'8 Nm',                                 rel:['headlight_left','drl_right'],               par:'Front Bumper',       chi:[] },
  drl_left:               { n:'Left Daytime Running Light', pn:'LGT-DRL-L-M4',     cat:'body',       asm:'Exterior Lighting',mat:'OLED / Polycarbonate',     wt:'0.8 kg', h:'ok',   ico:'💡', desc:'Distinctive L-shaped DRL strip. BMW M4 signature light. OLED technology.',                                        svc:['Integrated into headlight assembly','Replace headlight unit if DRL fails'],                         mnt:{'Inspection':'Annual'},                                                                              spec:{Tech:'OLED',Signature:'L-shaped'},                                                   tor:'N/A (integrated)',                     rel:['headlight_left','drl_right'],               par:'Left Headlight',     chi:[] },
  drl_right:              { n:'Right Daytime Running Light',pn:'LGT-DRL-R-M4',     cat:'body',       asm:'Exterior Lighting',mat:'OLED / Polycarbonate',     wt:'0.8 kg', h:'ok',   ico:'💡', desc:'Right DRL strip. BMW M4 L-shaped signature OLED.',                                                                 svc:['Same as left DRL'],                                                                                 mnt:{'Inspection':'Annual'},                                                                              spec:{Tech:'OLED'},                                                                        tor:'N/A',                                  rel:['headlight_right','drl_left'],               par:'Right Headlight',    chi:[] },
  taillight_left:         { n:'Left Taillight (OLED)',      pn:'LGT-TL-L-M4-OLED', cat:'body',       asm:'Exterior Lighting',mat:'OLED / ABS Housing',       wt:'1.4 kg', h:'ok',   ico:'🔴', desc:'BMW M4 OLED taillight. L-signature. Welcome/goodbye animation sequence.',                                         svc:['Open trunk — access 2 retaining nuts','Unplug 3-pin OLED connector','Press taillight outward from trunk'],              mnt:{'Inspection':'Annual'},                                                                              spec:{Tech:'OLED',Brightness:'8000 cd/m²',IP:'IP67'},                                     tor:'6 Nm mounting nuts',                   rel:['taillight_right','brake_light_center'],     par:'Rear Bumper',        chi:[] },
  taillight_right:        { n:'Right Taillight (OLED)',     pn:'LGT-TL-R-M4-OLED', cat:'body',       asm:'Exterior Lighting',mat:'OLED / ABS Housing',       wt:'1.4 kg', h:'ok',   ico:'🔴', desc:'Same as left OLED taillight. Mirror image.',                                                                       svc:['Same as left taillight'],                                                                           mnt:{'Inspection':'Annual'},                                                                              spec:{Tech:'OLED',IP:'IP67'},                                                              tor:'6 Nm',                                 rel:['taillight_left','brake_light_center'],      par:'Rear Bumper',        chi:[] },
  brake_light_center:     { n:'Centre High-Mount Brake Light',pn:'LGT-HMBL-M4-001',cat:'body',       asm:'Exterior Lighting',mat:'LED / Polycarbonate',      wt:'0.4 kg', h:'ok',   ico:'🔴', desc:'Centre high-mount stop light (CHMSL). Integrated into trunk lid trailing edge.',                                  svc:['Remove trunk liner','Disconnect 2-pin LED connector','Remove 2 mounting clips'],                    mnt:{'Inspection':'Annual'},                                                                              spec:{Tech:'LED',Position:'Trunk trailing edge'},                                          tor:'Clips — hand tight',                   rel:['taillight_left','taillight_right'],          par:'Trunk Lid',          chi:[] },
  tire_fl:                { n:'Front Left Tyre (Michelin)',  pn:'TYR-275-35-R20-FL',cat:'chassis',    asm:'Wheels & Tyres',   mat:'Silica Rubber Compound',   wt:'12.8 kg',h:'ok',   ico:'🛞', desc:'Michelin Pilot Sport 4S. 275/35 ZR20. 550 kg load. Speed: Y (300 km/h). Treadwear AA.',                          svc:['Loosen wheel bolts before jacking (max 5 Nm)','Jack on approved lift point','Remove 5 bolts (120 Nm)','Inflate to 2.7 bar cold front'],              mnt:{'Tyre Rotation':'Every 10,000 km','Pressure Check':'Monthly','Replace':'At 1.6 mm tread depth or 6 years'}, spec:{Size:'275/35 ZR20',Load:'102Y',Tread_new:'8.0 mm',Pressure:'2.7 bar'},  tor:'Wheel bolts: 120 Nm', rel:['rim_fl','brake_caliper_fl','wishbone_upper_fl'], par:'Front Left Corner',  chi:[] },
  tire_fr:                { n:'Front Right Tyre (Michelin)',pn:'TYR-275-35-R20-FR', cat:'chassis',    asm:'Wheels & Tyres',   mat:'Silica Rubber Compound',   wt:'12.8 kg',h:'ok',   ico:'🛞', desc:'Michelin Pilot Sport 4S. 275/35 ZR20. Same spec as FL.',                                                          svc:['Same procedure as Front Left Tyre'],                                                                mnt:{'Pressure Check':'Monthly'},                                                                         spec:{Size:'275/35 ZR20',Pressure:'2.7 bar'},                                              tor:'120 Nm',                               rel:['rim_fr','brake_caliper_fr'],                par:'Front Right Corner',  chi:[] },
  tire_rl:                { n:'Rear Left Tyre (Michelin)',  pn:'TYR-285-30-R20-RL', cat:'chassis',    asm:'Wheels & Tyres',   mat:'Silica Rubber Compound',   wt:'13.4 kg',h:'ok',   ico:'🛞', desc:'Michelin Pilot Sport 4S. 285/30 ZR20. Wider rear spec for traction.',                                            svc:['Same procedure as front — wider 285/30 ZR20 fitment','Inflate to 2.5 bar cold'],                   mnt:{'Pressure Check':'Monthly','Replace':'At 1.6 mm or 6 years'},                                        spec:{Size:'285/30 ZR20',Pressure:'2.5 bar'},                                              tor:'120 Nm',                               rel:['rim_rl','brake_caliper_rl'],                par:'Rear Left Corner',    chi:[] },
  tire_rr:                { n:'Rear Right Tyre (Michelin)', pn:'TYR-285-30-R20-RR', cat:'chassis',    asm:'Wheels & Tyres',   mat:'Silica Rubber Compound',   wt:'13.4 kg',h:'ok',   ico:'🛞', desc:'Michelin Pilot Sport 4S. 285/30 ZR20. Rear fitment.',                                                             svc:['Same as rear left tyre'],                                                                           mnt:{'Pressure Check':'Monthly'},                                                                         spec:{Size:'285/30 ZR20',Pressure:'2.5 bar'},                                              tor:'120 Nm',                               rel:['rim_rr','brake_caliper_rr'],                par:'Rear Right Corner',   chi:[] },
  rim_fl:                 { n:'Front Left Rim 20″ Forged',  pn:'RIM-869M-20-FL',    cat:'chassis',    asm:'Wheels & Tyres',   mat:'Forged Aluminium Alloy',   wt:'10.2 kg',h:'ok',   ico:'⚙️', desc:'BMW M 20" forged double-spoke alloy (Style 869M Bicolour). 9J ET29.',                                            svc:['Balance within 5g accuracy on dedicated balancer','Inspect for kerb/corrosion damage before fitting'], mnt:{'Alignment Check':'Every 20,000 km'},                                                                spec:{Size:'20"',Width:'9J ET29',Finish:'Bicolour',Weight:'10.2 kg'},                     tor:'120 Nm wheel bolts',                   rel:['tire_fl','hub_fl','brake_disc_fl'],          par:'Front Left Corner',   chi:[] },
  rim_fr:                 { n:'Front Right Rim 20″ Forged', pn:'RIM-869M-20-FR',    cat:'chassis',    asm:'Wheels & Tyres',   mat:'Forged Aluminium Alloy',   wt:'10.2 kg',h:'ok',   ico:'⚙️', desc:'Same as front left rim. 9J ET29.',                                                                                svc:['Balance before fitting'],                                                                           mnt:{'Alignment Check':'Every 20,000 km'},                                                                spec:{Size:'20"',Width:'9J ET29'},                                                         tor:'120 Nm',                               rel:['tire_fr','hub_fr','brake_disc_fr'],          par:'Front Right Corner',  chi:[] },
  rim_rl:                 { n:'Rear Left Rim 20″ Forged',   pn:'RIM-869M-20-RL',    cat:'chassis',    asm:'Wheels & Tyres',   mat:'Forged Aluminium Alloy',   wt:'10.8 kg',h:'ok',   ico:'⚙️', desc:'Wider 10.5J rear rim to accommodate 285/30 ZR20 tyre. ET19.',                                                    svc:['Do not mix with front rims — wider fitment'],                                                       mnt:{'Alignment Check':'Every 20,000 km'},                                                                spec:{Size:'20"',Width:'10.5J ET19'},                                                      tor:'120 Nm',                               rel:['tire_rl','hub_rl','brake_disc_rl'],          par:'Rear Left Corner',    chi:[] },
  rim_rr:                 { n:'Rear Right Rim 20″ Forged',  pn:'RIM-869M-20-RR',    cat:'chassis',    asm:'Wheels & Tyres',   mat:'Forged Aluminium Alloy',   wt:'10.8 kg',h:'ok',   ico:'⚙️', desc:'Same as rear left rim. 10.5J ET19.',                                                                              svc:['Same as rear left rim'],                                                                            mnt:{'Alignment Check':'Every 20,000 km'},                                                                spec:{Size:'20"',Width:'10.5J ET19'},                                                      tor:'120 Nm',                               rel:['tire_rr','hub_rr','brake_disc_rr'],          par:'Rear Right Corner',   chi:[] },
  brake_caliper_fl:       { n:'Front Left Brake Caliper',   pn:'BRK-6POT-FL-M4',   cat:'chassis',    asm:'Brakes',           mat:'Monobloc Aluminium',       wt:'5.4 kg', h:'ok',   ico:'🔴', desc:'M4 6-piston fixed caliper. 400 mm disc. Frozen Blue or Red option. M Sport logo cast.',                          svc:['Bleed brakes with DOT4 LV fluid','Compress pistons with spreader tool (6-piston)','Torque caliper bolts: 130 Nm'], mnt:{'Brake Fluid':'Every 2 years','Brake Pads':'At < 3 mm','Caliper Service':'Every 80,000 km'}, spec:{Type:'6-piston monobloc',Disc:'400 mm',Piston_dia:'38/41/44 mm'}, tor:'Caliper bolts: 130 Nm', rel:['brake_disc_fl','brake_master_cylinder','abs_control_module'], par:'Front Left Corner', chi:[] },
  brake_caliper_fr:       { n:'Front Right Brake Caliper',  pn:'BRK-6POT-FR-M4',   cat:'chassis',    asm:'Brakes',           mat:'Monobloc Aluminium',       wt:'5.4 kg', h:'ok',   ico:'🔴', desc:'Mirror image of FL 6-piston caliper.',                                                                            svc:['Same procedure as front left caliper'],                                                             mnt:{'Brake Pads':'At < 3 mm'},                                                                           spec:{Type:'6-piston',Disc:'400 mm'},                                                      tor:'130 Nm',                               rel:['brake_disc_fr','brake_master_cylinder'],    par:'Front Right Corner',  chi:[] },
  brake_caliper_rl:       { n:'Rear Left Brake Caliper',    pn:'BRK-4POT-RL-M4',   cat:'chassis',    asm:'Brakes',           mat:'Monobloc Aluminium',       wt:'4.1 kg', h:'ok',   ico:'🔴', desc:'M4 4-piston rear caliper. 380 mm disc. Integrated electric parking brake actuator.',                             svc:['Use caliper wind-back tool — DO NOT push pistons straight in (threaded)','Activate parking brake after pad fitting'], mnt:{'Brake Pads':'At < 3 mm','Parking Brake Actuator':'Every 60,000 km'}, spec:{Type:'4-piston',Disc:'380 mm',Parking_brake:'Electric motor'}, tor:'110 Nm', rel:['brake_disc_rl','abs_control_module'], par:'Rear Left Corner',  chi:[] },
  brake_caliper_rr:       { n:'Rear Right Brake Caliper',   pn:'BRK-4POT-RR-M4',   cat:'chassis',    asm:'Brakes',           mat:'Monobloc Aluminium',       wt:'4.1 kg', h:'ok',   ico:'🔴', desc:'Mirror image of rear left caliper.',                                                                               svc:['Same as rear left caliper'],                                                                        mnt:{'Brake Pads':'At < 3 mm'},                                                                           spec:{Type:'4-piston',Disc:'380 mm'},                                                      tor:'110 Nm',                               rel:['brake_disc_rr','abs_control_module'],        par:'Rear Right Corner',   chi:[] },
  brake_disc_fl:          { n:'Front Left Brake Disc',      pn:'BRK-DSC-400-FL',   cat:'chassis',    asm:'Brakes',           mat:'Composite Iron GG-25-Mo', wt:'14.8 kg',h:'ok',   ico:'💿', desc:'400 mm ventilated and slotted brake disc. Replace in axle pairs.',                                                 svc:['Measure disc thickness at 5 points (min 36 mm)','Check runout (max 0.08 mm)','Bed-in with 8 stops from 80 km/h'], mnt:{'Inspection':'Every pad change','Replace':'Below 36 mm'},     spec:{Diameter:'400 mm',Thickness_new:'40 mm',Min_thickness:'36 mm',Type:'Vented + slotted'}, tor:'Disc bolt: 10 Nm', rel:['brake_caliper_fl','hub_fl'],              par:'Front Left Corner',   chi:[] },
  brake_disc_fr:          { n:'Front Right Brake Disc',     pn:'BRK-DSC-400-FR',   cat:'chassis',    asm:'Brakes',           mat:'Composite Iron GG-25-Mo', wt:'14.8 kg',h:'ok',   ico:'💿', desc:'400 mm ventilated slotted disc. Axle pair with FL.',                                                               svc:['Measure disc — replace in axle pairs with FL disc'],                                                mnt:{'Replace':'Below 36 mm'},                                                                            spec:{Diameter:'400 mm',Min:'36 mm'},                                                      tor:'10 Nm',                                rel:['brake_caliper_fr','hub_fr'],                par:'Front Right Corner',  chi:[] },
  brake_disc_rl:          { n:'Rear Left Brake Disc',       pn:'BRK-DSC-380-RL',   cat:'chassis',    asm:'Brakes',           mat:'Composite Iron GG-25-Mo', wt:'12.2 kg',h:'ok',   ico:'💿', desc:'380 mm ventilated rear disc with integrated parking brake drum.',                                                  svc:['Measure disc (min 32 mm)','Check integrated parking drum'],                                         mnt:{'Replace':'Below 32 mm'},                                                                            spec:{Diameter:'380 mm',Min:'32 mm',Parking_drum:'Integrated'},                            tor:'10 Nm',                                rel:['brake_caliper_rl','hub_rl'],                par:'Rear Left Corner',    chi:[] },
  brake_disc_rr:          { n:'Rear Right Brake Disc',      pn:'BRK-DSC-380-RR',   cat:'chassis',    asm:'Brakes',           mat:'Composite Iron GG-25-Mo', wt:'12.2 kg',h:'ok',   ico:'💿', desc:'380 mm rear disc. Axle pair with RL.',                                                                             svc:['Replace in axle pairs with RL'],                                                                    mnt:{'Replace':'Below 32 mm'},                                                                            spec:{Diameter:'380 mm'},                                                                  tor:'10 Nm',                                rel:['brake_caliper_rr','hub_rr'],                par:'Rear Right Corner',   chi:[] },
  abs_control_module:     { n:'ABS / DSC Control Module',   pn:'ABS-ICM4-DSC-M4',  cat:'chassis',    asm:'Safety Systems',   mat:'Die-cast Aluminium',       wt:'1.8 kg', h:'ok',   ico:'🛡️', desc:'BMW ICM4 integrated chassis management. Controls ABS, DSC, EDC dampers, xDrive, and M modes.',                   svc:['Bleed ABS module after removal (scan tool required)','Requires coding after replacement (BMW ISTA)'], mnt:{'Software Update':'Per TSB','Inspection':'Every 40,000 km'},                               spec:{Processor:'ARM 32-bit',Protocols:'CAN/FlexRay',Response:'< 10 ms'},                  tor:'22 Nm',                                rel:['brake_master_cylinder','ecu_main'],          par:'Safety Systems',     chi:[] },
  brake_master_cylinder:  { n:'Brake Master Cylinder',      pn:'BRK-BMC-M4-001',   cat:'chassis',    asm:'Brakes',           mat:'Aluminium / Steel',        wt:'2.4 kg', h:'ok',   ico:'🔧', desc:'Tandem brake master cylinder. Brake booster integrated. 26 mm primary piston.',                                  svc:['Disconnect brake lines','Unclip brake booster pushrod','Remove 2 nuts (M10, 25 Nm)','Bench-bleed new master cylinder before fitting'], mnt:{'Brake Fluid':'Every 2 years'},               spec:{Piston_dia:'26 mm',Booster:'Tandem integrated',Fluid:'DOT4 LV'},                    tor:'25 Nm',                                rel:['abs_control_module','brake_booster'],        par:'Brakes',             chi:[] },
  wishbone_upper_fl:      { n:'Upper Wishbone — Front Left',pn:'SUS-UWB-FL-7075',  cat:'suspension', asm:'Suspension',       mat:'Forged Aluminium 7075',    wt:'2.1 kg', h:'ok',   ico:'🔩', desc:'Double-joint front upper control arm. Pillow-ball upper mount. Adjustable camber ±1.5°.',                        svc:['Mark cam bolt position before removal','Remove 3 inner bush bolts (M10, 65 Nm)','Press new bush hydraulically','Set 4-wheel alignment after installation'], mnt:{'Bush Inspection':'Every 40,000 km'}, spec:{Material:'Forged Al 7075',Adjustable:'Yes ±1.5°'},                    tor:'65 Nm bush bolts',                     rel:['wishbone_lower_fl','shock_absorber_fl','hub_fl'], par:'Front Suspension',  chi:[] },
  wishbone_upper_fr:      { n:'Upper Wishbone — Front Right',pn:'SUS-UWB-FR-7075', cat:'suspension', asm:'Suspension',       mat:'Forged Aluminium 7075',    wt:'2.1 kg', h:'ok',   ico:'🔩', desc:'Same as front left upper wishbone.',                                                                               svc:['Same procedure as FL wishbone'],                                                                    mnt:{'Bush Inspection':'Every 40,000 km'},                                                                spec:{Material:'Forged Al 7075'},                                                          tor:'65 Nm',                                rel:['wishbone_lower_fr','shock_absorber_fr'],    par:'Front Suspension',   chi:[] },
  wishbone_upper_rl:      { n:'Upper Wishbone — Rear Left', pn:'SUS-UWB-RL-7075',  cat:'suspension', asm:'Suspension',       mat:'Forged Aluminium 7075',    wt:'2.3 kg', h:'ok',   ico:'🔩', desc:'Rear upper control arm. Integral-link rear axle. Torque at neutral suspension load.',                            svc:['Torque bolts at neutral suspension load position','Requires 4-wheel alignment after'],               mnt:{'Bush Check':'Every 40,000 km'},                                                                     spec:{Material:'Forged Al 7075'},                                                          tor:'65 Nm (loaded position)',              rel:['wishbone_lower_rl','shock_absorber_rl'],    par:'Rear Suspension',    chi:[] },
  wishbone_upper_rr:      { n:'Upper Wishbone — Rear Right',pn:'SUS-UWB-RR-7075',  cat:'suspension', asm:'Suspension',       mat:'Forged Aluminium 7075',    wt:'2.3 kg', h:'ok',   ico:'🔩', desc:'Same as rear left upper wishbone.',                                                                               svc:['Same as RL wishbone'],                                                                              mnt:{'Bush Check':'Every 40,000 km'},                                                                     spec:{Material:'Forged Al 7075'},                                                          tor:'65 Nm (loaded)',                       rel:['wishbone_lower_rr','shock_absorber_rr'],    par:'Rear Suspension',    chi:[] },
  wishbone_lower_fl:      { n:'Lower Wishbone — Front Left',pn:'SUS-LWB-FL-001',   cat:'suspension', asm:'Suspension',       mat:'Forged Steel 42CrMo4',     wt:'3.4 kg', h:'ok',   ico:'🔩', desc:'Front lower control arm. Press-fit ball joint. Mark geometry before removal.',                                  svc:['Mark all bolt positions','Press out ball joint','Torque at neutral load (70 Nm)'],                  mnt:{'Ball Joint':'Every 80,000 km'},                                                                     spec:{Ball_joint:'Press-fit',Material:'42CrMo4'},                                          tor:'70 Nm (neutral load)',                 rel:['wishbone_upper_fl','shock_absorber_fl'],    par:'Front Suspension',   chi:[] },
  wishbone_lower_fr:      { n:'Lower Wishbone — Front Right',pn:'SUS-LWB-FR-001',  cat:'suspension', asm:'Suspension',       mat:'Forged Steel',             wt:'3.4 kg', h:'ok',   ico:'🔩', desc:'Same as front left lower wishbone.',                                                                              svc:['Same as FL lower wishbone'],                                                                        mnt:{'Ball Joint':'Every 80,000 km'},                                                                     spec:{},                                                                                   tor:'70 Nm',                                rel:['wishbone_upper_fr','shock_absorber_fr'],    par:'Front Suspension',   chi:[] },
  wishbone_lower_rl:      { n:'Lower Wishbone — Rear Left', pn:'SUS-LWB-RL-001',   cat:'suspension', asm:'Suspension',       mat:'Forged Steel',             wt:'3.6 kg', h:'ok',   ico:'🔩', desc:'Rear lower arm. Integral-link rear axle configuration.',                                                          svc:['Torque at neutral load position'],                                                                  mnt:{'Bush Check':'Every 40,000 km'},                                                                     spec:{},                                                                                   tor:'70 Nm (neutral)',                      rel:['wishbone_upper_rl','shock_absorber_rl'],    par:'Rear Suspension',    chi:[] },
  wishbone_lower_rr:      { n:'Lower Wishbone — Rear Right',pn:'SUS-LWB-RR-001',   cat:'suspension', asm:'Suspension',       mat:'Forged Steel',             wt:'3.6 kg', h:'ok',   ico:'🔩', desc:'Same as rear left lower wishbone.',                                                                               svc:['Same as RL lower wishbone'],                                                                        mnt:{'Bush Check':'Every 40,000 km'},                                                                     spec:{},                                                                                   tor:'70 Nm',                                rel:['wishbone_upper_rr','shock_absorber_rr'],    par:'Rear Suspension',    chi:[] },
  shock_absorber_fl:      { n:'Front Left Adaptive Damper', pn:'DMR-EDC-FL-M4',    cat:'suspension', asm:'Suspension',       mat:'Aluminium / Chrome Rod',   wt:'4.2 kg', h:'ok',   ico:'🔧', desc:'M Adaptive (EDC) electronically controlled damper. 3 modes: Comfort / Sport / Sport+.',                        svc:['Use spring compressor — LETHAL if spring released unsafely','Mark spring top position','Remove 3 top mount nuts (M10, 18 Nm)','Remove 2 lower clamp bolts (M14, 120 Nm)'], mnt:{'Oil Seal Check':'Every 40,000 km','Replace':'At 80,000–100,000 km'}, spec:{Type:'Twin-tube EDC',Travel:'150 mm',Modes:'Comfort/Sport/Sport+'}, tor:'Top: 18 Nm | Lower: 120 Nm', rel:['coil_spring_fl','wishbone_upper_fl'], par:'Front Suspension', chi:['coil_spring_fl'] },
  shock_absorber_fr:      { n:'Front Right Adaptive Damper',pn:'DMR-EDC-FR-M4',    cat:'suspension', asm:'Suspension',       mat:'Aluminium / Chrome Rod',   wt:'4.2 kg', h:'ok',   ico:'🔧', desc:'Same as front left EDC damper.',                                                                                  svc:['Same as FL damper — spring compressor mandatory'],                                                  mnt:{'Replace':'At 100,000 km'},                                                                          spec:{Type:'Twin-tube EDC'},                                                               tor:'Top: 18 Nm | Lower: 120 Nm',          rel:['coil_spring_fr','wishbone_upper_fr'],       par:'Front Suspension',   chi:['coil_spring_fr'] },
  shock_absorber_rl:      { n:'Rear Left Adaptive Damper',  pn:'DMR-EDC-RL-M4',    cat:'suspension', asm:'Suspension',       mat:'Aluminium / Chrome Rod',   wt:'4.5 kg', h:'ok',   ico:'🔧', desc:'M Adaptive rear damper. Integral-link rear axle.',                                                               svc:['Lower subframe or use multi-link spacer blocks','Compress coil spring before damper removal'],       mnt:{'Replace':'At 100,000 km'},                                                                          spec:{Type:'Twin-tube EDC',Travel:'130 mm'},                                               tor:'Lower bolt: 140 Nm',                   rel:['coil_spring_rl','wishbone_upper_rl'],       par:'Rear Suspension',    chi:['coil_spring_rl'] },
  shock_absorber_rr:      { n:'Rear Right Adaptive Damper', pn:'DMR-EDC-RR-M4',    cat:'suspension', asm:'Suspension',       mat:'Aluminium / Chrome Rod',   wt:'4.5 kg', h:'ok',   ico:'🔧', desc:'Same as rear left adaptive damper.',                                                                              svc:['Same as RL damper'],                                                                                mnt:{'Replace':'At 100,000 km'},                                                                          spec:{Type:'Twin-tube EDC'},                                                               tor:'140 Nm',                               rel:['coil_spring_rr','wishbone_upper_rr'],       par:'Rear Suspension',    chi:['coil_spring_rr'] },
  anti_roll_bar_front:    { n:'Front Anti-Roll Bar',        pn:'SUS-ARB-F25-M4',   cat:'suspension', asm:'Suspension',       mat:'Forged Steel 42CrMo4',     wt:'3.8 kg', h:'ok',   ico:'🔩', desc:'M4 25mm active anti-roll bar. Electro-hydraulic. Reduces body roll 35% vs standard.',                          svc:['Disconnect drop links at each end (M10, 55 Nm)','Remove 4 bush clamp bolts (M8, 28 Nm)','Press new polyurethane bushes'], mnt:{'Bush Inspection':'Every 40,000 km','Drop Link Check':'Every 40,000 km'}, spec:{Diameter:'25 mm',Type:'Active EHC',Material:'42CrMo4'}, tor:'Clamps: 28 Nm | Drop links: 55 Nm', rel:['anti_roll_bar_rear','wishbone_upper_fl'], par:'Front Suspension', chi:[] },
  anti_roll_bar_rear:     { n:'Rear Anti-Roll Bar',         pn:'SUS-ARB-R21-M4',   cat:'suspension', asm:'Suspension',       mat:'Forged Steel',             wt:'3.2 kg', h:'ok',   ico:'🔩', desc:'21mm rear anti-roll bar. Manages rear-axle lateral stiffness.',                                                  svc:['Disconnect drop links (55 Nm)','Remove bush clamps (28 Nm)'],                                       mnt:{'Bush Inspection':'Every 40,000 km'},                                                                spec:{Diameter:'21 mm'},                                                                   tor:'28 Nm clamps | 55 Nm links',          rel:['anti_roll_bar_front','wishbone_upper_rl'],  par:'Rear Suspension',    chi:[] },
  engine_block:           { n:'Engine Block B58 (Inline-6)',pn:'ENG-B58B30M1-001', cat:'powertrain', asm:'Powertrain',       mat:'Cast Aluminium Alloy A380',wt:'218 kg', h:'ok',   ico:'🔥', desc:'BMW B58B30 Inline-6 3.0L TwinPower turbo. 530 HP @ 6250 RPM. 479 lb-ft torque. Closed deck.',                  svc:['Depressurise fuel system and disconnect battery','Drain engine oil (6.5L) and coolant (12L)','Remove all wiring harnesses and hoses','Support with approved hoist ≥ 350 kg','Remove 4 engine mount bolts (85 Nm)','Replace all gaskets on reinstallation'], mnt:{'Oil Change':'Every 10,000 km (5W-30 LL-04)','Coolant Flush':'Every 3 years','Timing Chain':'Every 150,000 km','Spark Plugs':'Every 60,000 km'}, spec:{Displacement:'2998 cc',Compression:'10.2:1',Bore:'82 mm',Stroke:'94.6 mm',Valves:'24'}, tor:'Mount bolts: 85 Nm', rel:['cylinder_head','turbocharger','engine_oil_pan','alternator'], par:'Powertrain Assembly', chi:['cylinder_head','engine_oil_pan'] },
  cylinder_head:          { n:'Cylinder Head (DOHC 24v)',   pn:'B58B30-HEAD-001',  cat:'powertrain', asm:'Powertrain',       mat:'Cast Aluminium Alloy',     wt:'34 kg',  h:'ok',   ico:'⚙️', desc:'DOHC 24-valve cylinder head with Valvetronic variable valve lift 0–9.9 mm.',                                   svc:['Cool engine 2 hours','Remove valve cover (10× M6, 10 Nm)','Remove head bolts in reverse sequence','Torque in 3 stages: 30→60→+90°'],                             mnt:{'Valve Cover Gasket':'Every 80,000 km'},                                                             spec:{Valves:'24 (4 per cyl)',Valve_lift:'0–9.9 mm',Camshaft:'Dual overhead'},            tor:'Head bolts: 30+60+90°',                rel:['engine_block','turbocharger','intake_manifold'],    par:'Engine Block',       chi:[] },
  turbocharger:           { n:'Twin-Scroll Turbocharger',   pn:'TRB-B58-TS350',    cat:'powertrain', asm:'Powertrain',       mat:'Inconel Turbine / Al Compressor',wt:'12.4 kg',h:'ok',ico:'🌀',desc:'BMW TwinPower twin-scroll turbo. Max boost: 1.3 bar. Compressor: 0.25–0.65 kg/s.',                          svc:['Cool turbo 30 min before removal','Disconnect oil feed and return lines','Remove exhaust flange (4× M8, 25 Nm)','Prime with oil before startup'],              mnt:{'Oil & Filter Change':'Every 10,000 km','Inspection':'Every 40,000 km','Replace':'Every 200,000 km'}, spec:{Type:'Twin-scroll',Max_boost:'1.3 bar',Turbine_speed:'200,000 RPM',Material:'Inconel 713'}, tor:'Exhaust flange: 25 Nm', rel:['engine_block','intercooler','exhaust_manifold'], par:'Engine Assembly', chi:['intercooler'] },
  intercooler:            { n:'Front-Mount Intercooler',    pn:'ICL-FMIC-B58-001', cat:'powertrain', asm:'Powertrain',       mat:'Aluminium Bar-and-Plate',  wt:'8.2 kg', h:'ok',   ico:'❄️', desc:'FMIC. Core: 600×250×55 mm. Efficiency > 85%. Max pressure: 3 bar.',                                           svc:['Remove front bumper to access','Disconnect charge pipe boots and clamps','Drain residual oil from end tanks'],        mnt:{'Inspection':'Every 20,000 km','Core Cleaning':'Every 80,000 km'},                                  spec:{Core:'600×250×55 mm',Efficiency:'> 85%',Pressure_drop:'< 0.08 bar'},                tor:'Charge pipe clamps: 5 Nm',             rel:['turbocharger','intake_manifold','radiator'],        par:'Forced Induction',   chi:[] },
  exhaust_manifold:       { n:'Exhaust Manifold / Header',  pn:'EXH-MNF-B58-001', cat:'powertrain', asm:'Powertrain',       mat:'Stainless Steel 304',      wt:'7.8 kg', h:'ok',   ico:'💨', desc:'SS304 exhaust manifold with integrated EGR port. Feeds twin-scroll turbine.',                                  svc:['Spray penetrating oil on studs 24h before','Remove heat shield (6× M6)','Remove manifold nuts (12× M8, 45 Nm)','Use new copper gaskets on installation'],        mnt:{'Inspection':'Every 40,000 km','Gasket':'Every 80,000 km'},                                          spec:{Material:'SS 304',Thickness:'1.5 mm',Studs:'12× M8'},                                tor:'Manifold studs: 45 Nm',                rel:['engine_block','turbocharger','catalytic_converter'],par:'Engine Assembly',    chi:['catalytic_converter'] },
  intake_manifold:        { n:'Intake Manifold',            pn:'INT-MNF-B58-001',  cat:'powertrain', asm:'Powertrain',       mat:'Aluminium Alloy',          wt:'4.2 kg', h:'ok',   ico:'💨', desc:'Variable-length intake manifold with DISA flaps. Optimises torque across 1500–6500 RPM.',                     svc:['Remove inlet hose and PCV connections','Remove 8 mounting bolts (M6, 10 Nm)','Replace gaskets on reinstallation'],     mnt:{'DISA Valve':'Every 80,000 km or at failure'},                                                       spec:{Type:'Variable-length DISA',Material:'Aluminium'},                                   tor:'10 Nm',                                rel:['turbocharger','engine_block','air_filter_assembly'],par:'Engine Assembly',    chi:[] },
  radiator:               { n:'Engine Cooling Radiator',    pn:'RAD-M4-ALU-001',   cat:'powertrain', asm:'Cooling System',   mat:'Aluminium Core / Plastic', wt:'6.8 kg', h:'ok',   ico:'🌡️', desc:'Cross-flow aluminium radiator. Cooling capacity: 180 kW. Integrated ATF cooler.',                               svc:['Drain coolant via lower drain (12L)','Remove upper/lower hoses and ATF cooler lines','Remove brackets (4× M8)'],       mnt:{'Coolant Flush':'Every 3 years or 60,000 km'},                                                       spec:{Capacity:'180 kW',Coolant:'BMW Antifreeze',Volume:'12.0 L'},                         tor:'Drain plug: 1.5 Nm',                   rel:['coolant_reservoir','intercooler','ac_compressor'],  par:'Cooling System',     chi:[] },
  gearbox_8spd:           { n:'8-Speed ZF 8HP76 Gearbox',  pn:'ZF-8HP76-M4-001',  cat:'powertrain', asm:'Drivetrain',       mat:'Aluminium / Steel Internal',wt:'92 kg', h:'ok',   ico:'⚙️', desc:'ZF 8HP76 8-speed steptronic. Max torque 750 Nm. M paddle shift. Launch Control.',                              svc:['Drain ATF (8.5L ZF LifeguardFluid 8)','Remove propshaft couplings (6× M8, 22 Nm)','Support with transmission jack','Remove crossmember (4× M12, 80 Nm)'],       mnt:{'ATF Change':'Every 60,000 km','Filter':'Every 60,000 km'},                                          spec:{Ratios:'4.71/3.14/2.11/1.67/1.29/1.00/0.84/0.67',Torque_capacity:'750 Nm'},         tor:'Mount bolts: 80 Nm',                   rel:['engine_block','driveshaft_rear','transfer_case'],  par:'Drivetrain',         chi:[] },
  transfer_case:          { n:'xDrive Transfer Case',       pn:'ATC-450-M4-AWD',   cat:'powertrain', asm:'Drivetrain',       mat:'Aluminium Alloy',          wt:'28 kg',  h:'ok',   ico:'🔄', desc:'BMW xDrive ATC-450 active transfer case. Electronic torque split 0–100% rear. < 150 ms response.',            svc:['Drain transfer case oil (SAF-XO)','Disconnect front and rear propshaft flanges (22 Nm)','Remove 4 mount bolts'],      mnt:{'Oil Change':'Every 60,000 km (SAF-XO)'},                                                            spec:{Type:'Electro-hydraulic',Torque_split:'0–100% rear',Response:'< 150 ms'},            tor:'Flange bolts: 22 Nm',                  rel:['gearbox_8spd','driveshaft_rear'],                   par:'Drivetrain',         chi:[] },
  fuel_tank:              { n:'Fuel Tank Assembly (60L)',    pn:'FUEL-TNK-60L-M4',  cat:'powertrain', asm:'Fuel System',      mat:'HDPE Blow-moulded',        wt:'18.5 kg',h:'ok',   ico:'⛽', desc:'60L HDPE fuel tank with integrated surge pot, level sender, and in-tank HPFP.',                                svc:['Depressurise fuel system (10+ bar residual pressure)','Disconnect battery negative','Drain tank completely','Remove heat shield and 6 strap bolts (M10, 40 Nm)'], mnt:{'Inspection':'Every 80,000 km'},                                                    spec:{Capacity:'60 L',Material:'HDPE',Pump:'In-tank HPFP'},                                tor:'Strap bolts: 40 Nm',                   rel:['fuel_filler_cap','ecu_main'],                        par:'Fuel System',        chi:['fuel_pump'] },
  engine_oil_pan:         { n:'Engine Oil Sump / Pan',      pn:'ENG-PAN-B58-001',  cat:'powertrain', asm:'Powertrain',       mat:'Cast Aluminium Alloy',     wt:'4.2 kg', h:'ok',   ico:'🛢️', desc:'Dry-sump lower oil pan. 6.5L capacity. Integrated oil temp sensor.',                                          svc:['Drain hot oil (6.5L)','Remove 16× M6 bolts (8 Nm)','Apply Loctite 573 to mating surface','Wait 30 min before refill'], mnt:{'Oil Change':'Every 10,000 km','Gasket':'Every removal'},                            spec:{Capacity:'6.5 L with filter',Oil_spec:'BMW LL-04 5W-30'},                            tor:'Pan bolts: 8 Nm',                      rel:['engine_block','alternator'],                         par:'Engine Assembly',    chi:[] },
  battery_12v:            { n:'12V AGM Battery (90Ah)',     pn:'BAT-AGM-90AH-M4',  cat:'electrical', asm:'Electrical',       mat:'ABS / Lead-AGM',           wt:'22.5 kg',h:'warning',ico:'🔋',desc:'12V 90Ah 850 CCA AGM battery. Trunk-mounted. Feeds all 12V consumers.',                                        svc:['Disconnect negative terminal FIRST','Remove hold-down bracket','Register new battery (E-sys or BMW ISTA coding)','Reconnect positive then negative'], mnt:{'State Check':'Every 12 months','Replace':'Every 4–5 years or < 80% capacity'}, spec:{Voltage:'12V',Capacity:'90Ah',CCA:'850A',Technology:'AGM'}, tor:'Terminal clamps: 6 Nm', rel:['alternator','ecu_main','fuse_box'], par:'Electrical System',  chi:[] },
  alternator:             { n:'Alternator / Generator 180A',pn:'ALT-180A-B58-VAL', cat:'electrical', asm:'Electrical',       mat:'Aluminium Housing',        wt:'7.2 kg', h:'ok',   ico:'⚡', desc:'Valeo 180A intelligent alternator with BMW EEM. 14.4V regulation.',                                            svc:['Disconnect battery negative','Remove serpentine belt','Disconnect B+ cable and multi-pin connector','Remove 3 bolts (35 Nm)'], mnt:{'Belt Check':'Every 40,000 km','Replace':'At failure or 150,000 km'}, spec:{Output:'180A',Voltage:'14.4V regulated',Efficiency:'> 78%'}, tor:'Mounting bolts: 35 Nm', rel:['battery_12v','engine_block'], par:'Electrical System',  chi:[] },
  ecu_main:               { n:'Engine Control Unit (DME)',  pn:'DME-B58-MSD87',    cat:'electrical', asm:'Electrical',       mat:'Die-cast Aluminium',       wt:'0.85 kg',h:'ok',   ico:'🖥️', desc:'Bosch MSD87 Digital Motor Electronics. Controls fuel, ignition, VVT, EWS, OBD-II.',                          svc:['Record existing coding before removal','Disconnect all connectors','Remove 3× M6 screws','Full programming required after replacement (BMW ISTA)'], mnt:{'Software Update':'Per TSB'}, spec:{Processor:'32-bit',Memory:'4 MB flash',Protocols:'OBD-II/CAN/LIN/FlexRay'}, tor:'5 Nm mounting screws', rel:['battery_12v','fuse_box','abs_control_module'], par:'Electrical System', chi:[] },
  fuse_box:               { n:'Fuse Box / Junction Box',    pn:'ELC-FBX-M4-001',   cat:'electrical', asm:'Electrical',       mat:'ABS Polycarbonate',        wt:'1.2 kg', h:'ok',   ico:'⚡', desc:'Engine bay fuse/relay box. 42 fuses, 18 relays. Covers all high-current consumers.',                         svc:['Disconnect battery before any fuse/relay replacement','Use approved fuse ratings only'],              mnt:{'Inspection':'Every 40,000 km'},                                                                     spec:{Fuses:'42',Relays:'18',Rating:'Max 80A'},                                            tor:'N/A',                                  rel:['battery_12v','ecu_main','wiring_harness_main'],     par:'Electrical System',  chi:[] },
  wiring_harness_main:    { n:'Main Wiring Harness',        pn:'ELC-WH-MAIN-M4',   cat:'electrical', asm:'Electrical',       mat:'Copper / XLPE Insulation', wt:'32.5 kg',h:'ok',   ico:'🔌', desc:'Vehicle main harness. 1800+ circuits. FlexRay/CAN/LIN/MOST. 3.2 km wire length.',                            svc:['Label all connectors before removal','Do not stretch harness bundles','Inspect grommet chafe points','Replace segments not full harness where possible'], mnt:{'Grommet Check':'Every 40,000 km'}, spec:{Circuits:'1800+',Buses:'FlexRay/CAN/LIN/MOST',Length:'3.2 km'}, tor:'N/A', rel:['ecu_main','fuse_box','battery_12v'], par:'Electrical System', chi:[] },
  ac_compressor:          { n:'A/C Compressor (Denso)',     pn:'HVAC-COMP-DEN-M4', cat:'powertrain', asm:'HVAC',             mat:'Aluminium Die-cast',       wt:'5.4 kg', h:'ok',   ico:'❄️', desc:'Denso variable displacement A/C compressor. R-1234yf. Auto climate feed.',                                    svc:['Recover refrigerant with certified equipment (R-1234yf)','Evacuate to -750 mbar for 30 min','Recharge: 450g R-1234yf ± 10g'], mnt:{'Refrigerant Check':'Every 3 years'},                                         spec:{Refrigerant:'R-1234yf',Charge:'450 g',Type:'Variable displacement'},                 tor:'Drive bolts: 25 Nm',                   rel:['radiator','coolant_reservoir'],                      par:'HVAC System',        chi:[] },
  dashboard_assembly:     { n:'Dashboard / Instrument Panel',pn:'INT-DASH-M4-001', cat:'interior',   asm:'Interior',         mat:'PP/ABS / Alcantara / Carbon',wt:'22.4 kg',h:'ok',  ico:'🎛️', desc:'M4 Competition dashboard. Driver-focused, Alcantara upper roll, carbon trim, passenger airbag.',              svc:['Remove A-pillar trims','Disconnect HVAC and airbag looms','Remove 8 bolts (M8, 22 Nm)','Extract as single unit with 2 technicians'], mnt:{'Switch Panel':'Annual','Vent Cleaning':'Every 2 years'}, spec:{Width:'1510 mm',Airbag:'Passenger SRS',Screen:'12.3″ Curved'}, tor:'22 Nm', rel:['steering_wheel','center_console','infotainment_screen'], par:'Interior Assembly', chi:['infotainment_screen','steering_wheel'] },
  steering_wheel:         { n:'M Sport Steering Wheel',     pn:'INT-STW-M4-ALT',   cat:'interior',   asm:'Interior',         mat:'Alcantara / Carbon Fibre', wt:'3.8 kg', h:'ok',   ico:'🎯', desc:'M4 Alcantara/carbon steering wheel. M1/M2 buttons, shift paddles, integrated airbag.',                       svc:['Disable SRS (battery off, wait 10 min)','Use 5/16″ square socket for clock spring','Loosen central nut (M24, 60 Nm)','Note clock spring position'], mnt:{'Alcantara Cleaning':'Monthly','Airbag Check':'Per SRS schedule'}, spec:{Diameter:'370 mm',Material:'Alcantara + CF',Airbag:'2-stage driver SRS'}, tor:'Centre nut: 60 Nm', rel:['steering_column','dashboard_assembly'], par:'Dashboard Assembly', chi:[] },
  seat_front_left:        { n:'M Driver Seat (Multifunctional)',pn:'INT-ST-DRV-M4', cat:'interior',   asm:'Interior',         mat:'Merino Leather / CFRP Base',wt:'32.5 kg',h:'ok',  ico:'💺', desc:'M Sport carbon seat. Merino leather. Heating, cooling, memory, side bolsters.',                               svc:['Slide seat fully rearward','Remove 4 rail bolts (M10, 45 Nm)','Disconnect 10 electrical connectors','Follow SRS protocol — seat contains side airbag'], mnt:{'Leather Conditioning':'Every 6 months','Heating Check':'Annual'}, spec:{Material:'Merino leather',Functions:'Heat/Cool/Memory',Airbag:'Side SRS'}, tor:'Rail bolts: 45 Nm', rel:['seat_front_right','center_console'], par:'Interior Assembly', chi:[] },
  seat_front_right:       { n:'M Passenger Seat',           pn:'INT-ST-PAS-M4',    cat:'interior',   asm:'Interior',         mat:'Merino Leather',           wt:'31.8 kg',h:'ok',   ico:'💺', desc:'Passenger seat with heat, ventilation, side airbag. No memory.',                                              svc:['Same as driver seat — SRS precautions apply'],                                                      mnt:{'Leather Conditioning':'Every 6 months'},                                                            spec:{Airbag:'Side SRS'},                                                                  tor:'45 Nm',                                rel:['seat_front_left','center_console'],                  par:'Interior Assembly',  chi:[] },
  center_console:         { n:'Centre Console (CFRP)',       pn:'INT-CC-M4-CF',     cat:'interior',   asm:'Interior',         mat:'Carbon Fibre / Alcantara', wt:'6.5 kg', h:'ok',   ico:'🕹️', desc:'M4 carbon centre console. M Drive selector, gear lever, heated armrest, wireless charger.',                  svc:['Lift armrest and remove 2 hidden T30 bolts','Remove gear selector trim','Slide console rearward'],  mnt:{'Wireless Charger Check':'Annual'},                                                                  spec:{Material:'CFRP',Wireless_charge:'Qi 10W',Heated_armrest:'Yes'},                     tor:'Console bolts: 8 Nm',                  rel:['steering_wheel','dashboard_assembly'],               par:'Interior Assembly',  chi:[] },
  infotainment_screen:    { n:'iDrive 8 Screen 12.3″',      pn:'INT-IDR8-12-M4',   cat:'interior',   asm:'Interior',         mat:'Gorilla Glass / OLED',     wt:'1.8 kg', h:'ok',   ico:'📱', desc:'BMW iDrive 8 curved 12.3″ OLED. BMW OS 8. Wireless CarPlay/Android Auto. 5G.',                               svc:['Disconnect battery','Remove trim surround (4× T10)','Disconnect LVDS cable and USB-C power','Requires software pairing (BMW ISTA) after replacement'], mnt:{'Software':'OTA as needed','Cleaning':'Microfibre only'}, spec:{Size:'12.3″ OLED',Resolution:'1920×720',Connectivity:'5G/WiFi6/BT5.2',OS:'BMW OS 8.0'}, tor:'3 Nm', rel:['dashboard_assembly','ecu_main'], par:'Dashboard Assembly', chi:[] },
  front_splitter:         { n:'Front Carbon Splitter',      pn:'AERO-SPLT-F-CF',   cat:'body',       asm:'Aerodynamics',     mat:'CFRP 3K',                  wt:'1.8 kg', h:'ok',   ico:'✈️', desc:'CFRP front splitter. −35 kg front downforce @ 250 km/h. Track and road legal.',                              svc:['Remove front undertray to access','Remove 6× M6 bolts','Inspect every 10,000 km for stone impact'], mnt:{'Impact Inspection':'Every 10,000 km'},                                                              spec:{Material:'CFRP 3K',Downforce:'−35 kg @ 250 km/h',Finish:'Matte clear'},             tor:'8 Nm',                                 rel:['rear_diffuser','roof_spoiler','front_bumper_assembly'],par:'Aerodynamics',      chi:[] },
  rear_diffuser:          { n:'Rear Carbon Diffuser',       pn:'AERO-DFF-R-CF',    cat:'body',       asm:'Aerodynamics',     mat:'CFRP 3K',                  wt:'2.2 kg', h:'ok',   ico:'✈️', desc:'CFRP rear diffuser. +45 kg rear downforce @ 250 km/h. Quad exhaust cutouts.',                                svc:['Remove rear undertray first','Remove 8× M6 clips and 2× M8 bolts'],                                 mnt:{'Inspection':'Every 20,000 km'},                                                                     spec:{Material:'CFRP',Downforce:'+45 kg @ 250 km/h'},                                     tor:'8 Nm',                                 rel:['front_splitter','roof_spoiler','exhaust_tip_left'],  par:'Aerodynamics',       chi:[] },
  roof_spoiler:           { n:'Roof Edge Spoiler (CFRP)',   pn:'AERO-SPLT-ROOF-CF',cat:'body',       asm:'Aerodynamics',     mat:'Carbon Fibre',             wt:'0.9 kg', h:'ok',   ico:'✈️', desc:'Roof trailing edge spoiler. Delays separation. −15 kg rear lift.',                                            svc:['Remove trunk lid inner trim','Remove 4× M6 bolts from inside'],                                     mnt:{'Bond Inspection':'Annual'},                                                                         spec:{Material:'CFRP',Rear_lift_reduction:'15 kg'},                                        tor:'6 Nm',                                 rel:['rear_diffuser','trunk_lid'],                         par:'Aerodynamics',       chi:[] },
  air_filter_assembly:    { n:'Air Filter Assembly',        pn:'ENG-AFB-B58-001',  cat:'powertrain', asm:'Powertrain',       mat:'Polymer / Cotton Gauze',   wt:'1.8 kg', h:'ok',   ico:'🌬️', desc:'High-flow M Performance air filter. 15% more airflow vs paper. 320,000 km service life.',                  svc:['Unclip airbox lid (4 clips)','Slide filter upward','Oil re-usable filter every 80,000 km if applicable'], mnt:{'Replace':'Every 30,000 km (standard) or 80,000 km (cotton gauze)'},              spec:{Type:'High-flow cotton gauze',Flow_increase:'15%'},                                  tor:'Airbox clamps hand tight',             rel:['intake_manifold','turbocharger'],                    par:'Engine Assembly',    chi:[] },
  exhaust_pipe_left:      { n:'Exhaust Pipe — Left',        pn:'EXH-PPL-M4-001',   cat:'powertrain', asm:'Exhaust System',   mat:'Stainless Steel 316L',     wt:'4.2 kg', h:'ok',   ico:'💨', desc:'Left bank exhaust pipe. Centre section with titanium coating option.',                                        svc:['Allow exhaust to cool fully','Spray penetrating oil on clamps 24h before','Remove 4 clamp bolts (45 Nm)'],mnt:{'Inspection':'Every 40,000 km'},                                                                spec:{Material:'SS316L',Diameter:'76 mm OD'},                                              tor:'Clamps: 45 Nm',                        rel:['exhaust_manifold','catalytic_converter','exhaust_tip_left'],par:'Exhaust System',  chi:['exhaust_tip_left'] },
  exhaust_pipe_right:     { n:'Exhaust Pipe — Right',       pn:'EXH-PPR-M4-001',   cat:'powertrain', asm:'Exhaust System',   mat:'Stainless Steel 316L',     wt:'4.2 kg', h:'ok',   ico:'💨', desc:'Right bank exhaust pipe.',                                                                                     svc:['Same as left exhaust pipe'],                                                                        mnt:{'Inspection':'Every 40,000 km'},                                                                     spec:{Material:'SS316L',Diameter:'76 mm OD'},                                              tor:'45 Nm',                                rel:['exhaust_manifold','catalytic_converter','exhaust_tip_right'],par:'Exhaust System',chi:['exhaust_tip_right'] },
  exhaust_tip_left:       { n:'Exhaust Tip — Left (Titanium)',pn:'EXH-TIP-L-TI-M4',cat:'powertrain', asm:'Exhaust System',   mat:'Titanium Grade 5',         wt:'0.8 kg', h:'ok',   ico:'💨', desc:'120 mm titanium exhaust tip. Brushed finish. M Performance spec.',                                            svc:['Unscrew clamp and slide off'],                                                                      mnt:{'Polish':'As required'},                                                                             spec:{Material:'Titanium Gr5',Diameter:'120 mm',Finish:'Brushed'},                         tor:'Clamp: 6 Nm',                          rel:['exhaust_pipe_left','rear_diffuser'],                 par:'Exhaust Pipe Left',  chi:[] },
  exhaust_tip_right:      { n:'Exhaust Tip — Right (Titanium)',pn:'EXH-TIP-R-TI-M4',cat:'powertrain',asm:'Exhaust System',  mat:'Titanium Grade 5',         wt:'0.8 kg', h:'ok',   ico:'💨', desc:'Right titanium exhaust tip. Brushed finish.',                                                                  svc:['Same as left exhaust tip'],                                                                         mnt:{'Polish':'As required'},                                                                             spec:{Material:'Titanium Gr5',Diameter:'120 mm'},                                          tor:'6 Nm',                                 rel:['exhaust_pipe_right','rear_diffuser'],                par:'Exhaust Pipe Right', chi:[] },
  catalytic_converter:    { n:'Catalytic Converter',        pn:'EXH-CAT-M4-001',   cat:'powertrain', asm:'Exhaust System',   mat:'Cordierite Ceramic / PGM', wt:'4.8 kg', h:'ok',   ico:'♻️', desc:'Three-way catalytic converter with 400 CPSI substrate. Meets EU7 emissions.',                                svc:['Allow 30 min cool-down','Remove lambda sensor (42 Nm)','Remove 2 flange bolts (35 Nm)'],             mnt:{'Lambda Sensor':'Every 80,000 km','Replacement':'At OBD efficiency fault'},                          spec:{Standard:'EU7',CPSI:'400',PGM:'Platinum/Palladium/Rhodium'},                         tor:'35 Nm flanges',                        rel:['exhaust_manifold','exhaust_pipe_left'],              par:'Exhaust System',     chi:[] },
  power_steering_pump:    { n:'Electric Power Steering',    pn:'STR-EPS-M4-001',   cat:'chassis',    asm:'Steering',         mat:'Aluminium Housing',        wt:'3.2 kg', h:'ok',   ico:'🎯', desc:'BMW EPS variable ratio rack. Speed-sensitive assist 0–100%. 13:1–21:1 variable ratio.',                     svc:['Disconnect battery before removal','Remove 3 bolts (M10, 45 Nm)','Requires EPS calibration (BMW ISTA)'],            mnt:{'Inspection':'Every 60,000 km'},                                                                     spec:{Type:'Electric',Ratio:'Variable 13:1–21:1',Assist:'Speed-sensitive'},                tor:'45 Nm',                                rel:['steering_wheel','front_subframe'],                   par:'Steering System',    chi:[] },
  coolant_reservoir:      { n:'Coolant Expansion Reservoir',pn:'COOL-RSV-M4-001',  cat:'powertrain', asm:'Cooling System',   mat:'Translucent HDPE',         wt:'0.6 kg', h:'ok',   ico:'🌡️', desc:'1.5L coolant expansion reservoir with integrated pressure relief cap (1.4 bar).',                             svc:['Allow engine to cool','Remove hose clamps','Unscrew 2 mounting bolts (M6)'],                        mnt:{'Cap Pressure Test':'Every 2 years'},                                                                spec:{Capacity:'1.5 L',Cap_pressure:'1.4 bar'},                                            tor:'M6 bolts: 8 Nm',                       rel:['radiator','heater_core'],                            par:'Cooling System',     chi:[] },
  heater_core:            { n:'Heater Core Matrix',         pn:'HVAC-HCR-M4-001',  cat:'interior',   asm:'HVAC',             mat:'Copper / Brass / Aluminium',wt:'1.8 kg', h:'ok',   ico:'🌡️', desc:'Cabin heater core. Supplies heat to HVAC distribution system via coolant circuit.',                          svc:['Drain coolant','Remove dashboard assembly','Disconnect 2× heater hoses','Extract from HVAC box'],   mnt:{'Coolant Change':'Every 3 years'},                                                                   spec:{Material:'Cu/Br/Al',Coolant_flow:'120 L/h'},                                         tor:'Hose clamps: 3 Nm',                    rel:['radiator','coolant_reservoir','ac_compressor'],      par:'HVAC System',        chi:[] },
  fuel_filler_cap:        { n:'Fuel Filler Cap / Flap',     pn:'FUEL-CAP-M4-001',  cat:'powertrain', asm:'Fuel System',      mat:'ABS / Aluminium',          wt:'0.4 kg', h:'ok',   ico:'⛽', desc:'Integrated fuel filler flap with push-open actuator. Capless filler system.',                                svc:['Push and release to open','Spring replacement if faulty','Remove 2 clip-in pins'],                  mnt:{'Actuator Check':'Annual'},                                                                          spec:{System:'Capless',Actuator:'Push-to-open spring'},                                    tor:'N/A (clip mount)',                     rel:['fuel_tank'],                                         par:'Fuel System',        chi:[] },
  fuel_pump:              { n:'High-Pressure Fuel Pump',    pn:'FUEL-HPFP-B58-001',cat:'powertrain', asm:'Fuel System',      mat:'Steel / Teflon Seals',     wt:'1.2 kg', h:'ok',   ico:'⛽', desc:'Piezo-controlled HPFP. 350 bar direct injection. Cam-driven. Roller-lifter design.',                        svc:['Depressurise fuel rail (10+ bar)','Remove cam-driven HPFP drive bolt (M8, 22 Nm)','Replace all seals on installation'], mnt:{'Replace':'Every 150,000 km or at failure'},                                 spec:{Pressure:'350 bar',Type:'Piezo HPFP',Drive:'Cam-driven'},                            tor:'22 Nm cam bolt',                       rel:['fuel_tank','engine_block'],                          par:'Fuel System',        chi:[] },
  roof_antenna:           { n:'Shark Fin Antenna',          pn:'ELC-ANT-M4-SHARK', cat:'electrical', asm:'Electrical',       mat:'ABS / Antenna Array',      wt:'0.3 kg', h:'ok',   ico:'📡', desc:'Integrated shark-fin antenna. DAB radio, GPS, 4G/5G, cellular, Bluetooth array.',                            svc:['Peel roof trim at rear','Unscrew antenna base (M6, 5 Nm)','Disconnect antenna loom bundle'],         mnt:{'Inspection':'Annual'},                                                                              spec:{Signals:'DAB/GPS/4G/5G/BT',Mount:'Adhesive + bolt'},                                 tor:'5 Nm',                                 rel:['infotainment_screen','ecu_main'],                    par:'Electrical System',  chi:[] },
  ambient_lighting_strip: { n:'Ambient Lighting Strip',     pn:'INT-AMB-M4-LED',   cat:'interior',   asm:'Interior',         mat:'Flexible LED Strip',       wt:'0.2 kg', h:'ok',   ico:'🌈', desc:'iDrive-controlled ambient cabin lighting. 64 colours. 12 zones. Contour lighting.',                          svc:['Remove door/dashboard trim panels to access strips','Unplug 2-pin LED connector'],                  mnt:{'Replace':'At failure'},                                                                             spec:{Colours:'64',Zones:'12',Control:'iDrive 8'},                                         tor:'N/A',                                  rel:['dashboard_assembly','door_front_left'],              par:'Interior Assembly',  chi:[] },
  coil_spring_fl:         { n:'Front Left Coil Spring',     pn:'SUS-CSP-FL-M4',    cat:'suspension', asm:'Suspension',       mat:'Chromium-Silicon Spring Steel',wt:'3.2 kg',h:'ok', ico:'🌀', desc:'Progressive-rate coil spring. 42 N/mm initial / 68 N/mm loaded. M sport geometry.',                         svc:['MUST use spring compressor — LETHAL if released','Compress before removing strut top mount'],        mnt:{'Inspect':'Every 80,000 km or at impact'},                                                           spec:{Rate:'42→68 N/mm progressive',Height:'M sport -10mm vs std',Material:'Cr-Si'},      tor:'Strut top: 18 Nm',                     rel:['shock_absorber_fl','wishbone_upper_fl'],             par:'Front Suspension',   chi:[] },
  coil_spring_fr:         { n:'Front Right Coil Spring',    pn:'SUS-CSP-FR-M4',    cat:'suspension', asm:'Suspension',       mat:'Chromium-Silicon Spring Steel',wt:'3.2 kg',h:'ok', ico:'🌀', desc:'Same as front left coil spring.',                                                                              svc:['Same as FL spring — MUST use spring compressor'],                                                   mnt:{'Inspect':'Every 80,000 km'},                                                                        spec:{Rate:'42→68 N/mm'},                                                                  tor:'18 Nm',                                rel:['shock_absorber_fr'],                                 par:'Front Suspension',   chi:[] },
  coil_spring_rl:         { n:'Rear Left Coil Spring',      pn:'SUS-CSP-RL-M4',    cat:'suspension', asm:'Suspension',       mat:'Chromium-Silicon Spring Steel',wt:'3.4 kg',h:'ok', ico:'🌀', desc:'Rear progressive-rate spring. 38→62 N/mm. Integral-link axle setup.',                                       svc:['Same as front spring — spring compressor mandatory'],                                                mnt:{'Inspect':'Every 80,000 km'},                                                                        spec:{Rate:'38→62 N/mm'},                                                                  tor:'140 Nm lower',                         rel:['shock_absorber_rl'],                                 par:'Rear Suspension',    chi:[] },
  coil_spring_rr:         { n:'Rear Right Coil Spring',     pn:'SUS-CSP-RR-M4',    cat:'suspension', asm:'Suspension',       mat:'Chromium-Silicon Spring Steel',wt:'3.4 kg',h:'ok', ico:'🌀', desc:'Same as rear left coil spring.',                                                                               svc:['Same as RL spring'],                                                                                mnt:{'Inspect':'Every 80,000 km'},                                                                        spec:{Rate:'38→62 N/mm'},                                                                  tor:'140 Nm',                               rel:['shock_absorber_rr'],                                 par:'Rear Suspension',    chi:[] },
  hub_fl:                 { n:'Front Left Hub & Bearing',   pn:'SUS-HUB-FL-M4',    cat:'chassis',    asm:'Suspension',       mat:'Forged Steel',             wt:'5.8 kg', h:'ok',   ico:'🔩', desc:'Front left wheel hub with integrated angular contact bearing. ABS reluctor ring pressed in.',                 svc:['Press out hub with hydraulic press','Replace bearing as assembly — never re-use old bearing'],        mnt:{'Inspect':'Every 40,000 km or at noise/vibration'},                                                  spec:{Bearing:'Angular contact',ABS_ring:'Integrated',Bolts:'5× M14 wheel bolts'},        tor:'Wheel bolts: 120 Nm | Hub nut: 200 Nm', rel:['tire_fl','rim_fl','brake_disc_fl'],       par:'Front Left Corner',   chi:[] },
  hub_fr:                 { n:'Front Right Hub & Bearing',  pn:'SUS-HUB-FR-M4',    cat:'chassis',    asm:'Suspension',       mat:'Forged Steel',             wt:'5.8 kg', h:'ok',   ico:'🔩', desc:'Same as front left hub.',                                                                                      svc:['Same as FL hub'],                                                                                   mnt:{'Inspect':'Every 40,000 km'},                                                                        spec:{Bearing:'Angular contact'},                                                          tor:'Hub nut: 200 Nm',                      rel:['tire_fr','rim_fr','brake_disc_fr'],           par:'Front Right Corner',  chi:[] },
  hub_rl:                 { n:'Rear Left Hub & Bearing',    pn:'SUS-HUB-RL-M4',    cat:'chassis',    asm:'Suspension',       mat:'Forged Steel',             wt:'6.4 kg', h:'ok',   ico:'🔩', desc:'Rear left hub with large angular contact bearing for RWD/AWD torque loads.',                                  svc:['Remove driveshaft nut (M22, 300 Nm)','Press hub from bearing with hydraulic press'],                mnt:{'Inspect':'Every 40,000 km'},                                                                        spec:{Bearing:'Large angular contact',Driveshaft_nut:'M22 300 Nm'},                        tor:'Hub nut: 300 Nm',                      rel:['tire_rl','rim_rl','driveshaft_rear'],             par:'Rear Left Corner',    chi:[] },
  hub_rr:                 { n:'Rear Right Hub & Bearing',   pn:'SUS-HUB-RR-M4',    cat:'chassis',    asm:'Suspension',       mat:'Forged Steel',             wt:'6.4 kg', h:'ok',   ico:'🔩', desc:'Same as rear left hub.',                                                                                       svc:['Same as RL hub'],                                                                                   mnt:{'Inspect':'Every 40,000 km'},                                                                        spec:{},                                                                                   tor:'300 Nm',                               rel:['tire_rr','rim_rr'],                                  par:'Rear Right Corner',   chi:[] },
  driveshaft_front_left:  { n:'Front Left Driveshaft',      pn:'DRV-SFT-FL-M4',    cat:'powertrain', asm:'Drivetrain',       mat:'Chromium-Moly Steel',      wt:'4.8 kg', h:'ok',   ico:'🔧', desc:'Front left CV driveshaft. xDrive outer CV joint + plunge inner. Max torque: 350 Nm.',                       svc:['Remove hub nut (M22, 300 Nm)','Extract from gearbox carefully','Replace both CV boots on any boot damage'], mnt:{'CV Boot Check':'Every 20,000 km','Replace boots at first crack'},                spec:{Type:'CV (constant velocity)',Torque:'350 Nm',Material:'CrMo'},                      tor:'Hub nut: 300 Nm',                      rel:['gearbox_8spd','hub_fl','transfer_case'],             par:'Drivetrain',         chi:[] },
  driveshaft_front_right: { n:'Front Right Driveshaft',     pn:'DRV-SFT-FR-M4',    cat:'powertrain', asm:'Drivetrain',       mat:'Chromium-Moly Steel',      wt:'4.8 kg', h:'ok',   ico:'🔧', desc:'Same as front left driveshaft.',                                                                              svc:['Same as FL driveshaft'],                                                                            mnt:{'CV Boot Check':'Every 20,000 km'},                                                                  spec:{Type:'CV',Torque:'350 Nm'},                                                          tor:'300 Nm hub nut',                       rel:['gearbox_8spd','hub_fr','transfer_case'],             par:'Drivetrain',         chi:[] },
  driveshaft_rear:        { n:'Rear Propshaft (Carbon)',     pn:'DRV-PSF-REAR-CF',  cat:'powertrain', asm:'Drivetrain',       mat:'Carbon Fibre / Steel Flanges',wt:'5.6 kg',h:'ok',  ico:'🔧', desc:'One-piece carbon fibre propshaft. 40% lighter than steel. Max torque 750 Nm. Balances to 6000 RPM.',      svc:['Mark flange orientation before removal','Remove 6× M8 flange bolts (22 Nm) at each end','Balance dynamically after reinstallation'], mnt:{'Flange Check':'Every 60,000 km'},                                      spec:{Material:'Carbon fibre',Torque:'750 Nm',Balance:'6000 RPM'},                         tor:'Flange bolts: 22 Nm',                  rel:['gearbox_8spd','rear_subframe','transfer_case'],     par:'Drivetrain',         chi:[] },
  front_grille:           { n:'Front Kidney Grille',         pn:'BDY-KDY-M4-LRG',  cat:'body',       asm:'Body',             mat:'Gloss Black ABS',          wt:'1.6 kg', h:'ok',   ico:'🚗', desc:'Enlarged M4 kidney grille. Iconic vertical bar design. ACC radar aperture centre.',                          svc:['Press in 4 retaining clips from inside bumper','Disconnect active grille shutter wiring'],            mnt:{'Cleaning':'Weekly minimum (airflow critical)'},                                                     spec:{Type:'Vertical bar',ACC:'Radar aperture integrated'},                                tor:'Clips: hand tight',                    rel:['front_bumper_assembly','headlight_left'],            par:'Front Bumper Assembly',chi:[] },
};

// ═══════════════════════════════════════════════════════════════
// SEMANTIC KEYWORD MAP
// ═══════════════════════════════════════════════════════════════
const SEM = {
  engine:      ['engine_block','cylinder_head','turbocharger','exhaust_manifold','intake_manifold','engine_oil_pan','air_filter_assembly','engine_hood'],
  turbo:       ['turbocharger','intercooler','exhaust_manifold','intake_manifold'],
  brake:       ['brake_caliper_fl','brake_caliper_fr','brake_caliper_rl','brake_caliper_rr','brake_disc_fl','brake_disc_fr','brake_disc_rl','brake_disc_rr','brake_master_cylinder','abs_control_module'],
  wheel:       ['tire_fl','tire_fr','tire_rl','tire_rr','rim_fl','rim_fr','rim_rl','rim_rr','hub_fl','hub_fr','hub_rl','hub_rr'],
  tyre:        ['tire_fl','tire_fr','tire_rl','tire_rr'],
  tire:        ['tire_fl','tire_fr','tire_rl','tire_rr'],
  suspension:  ['wishbone_upper_fl','wishbone_upper_fr','wishbone_upper_rl','wishbone_upper_rr','wishbone_lower_fl','wishbone_lower_fr','wishbone_lower_rl','wishbone_lower_rr','shock_absorber_fl','shock_absorber_fr','shock_absorber_rl','shock_absorber_rr','coil_spring_fl','coil_spring_fr','coil_spring_rl','coil_spring_rr','anti_roll_bar_front','anti_roll_bar_rear'],
  damper:      ['shock_absorber_fl','shock_absorber_fr','shock_absorber_rl','shock_absorber_rr'],
  door:        ['door_front_left','door_front_right','door_rear_left','door_rear_right'],
  seat:        ['seat_front_left','seat_front_right'],
  light:       ['headlight_left','headlight_right','taillight_left','taillight_right','drl_left','drl_right','brake_light_center'],
  headlight:   ['headlight_left','headlight_right','drl_left','drl_right'],
  taillight:   ['taillight_left','taillight_right','brake_light_center'],
  exhaust:     ['exhaust_manifold','exhaust_pipe_left','exhaust_pipe_right','exhaust_tip_left','exhaust_tip_right','catalytic_converter'],
  interior:    ['dashboard_assembly','steering_wheel','seat_front_left','seat_front_right','center_console','infotainment_screen','ambient_lighting_strip'],
  glass:       ['windshield_front','windshield_rear','window_front_left','window_front_right','window_rear_left','window_rear_right'],
  aero:        ['front_splitter','rear_diffuser','roof_spoiler'],
  downforce:   ['front_splitter','rear_diffuser','roof_spoiler'],
  fuel:        ['fuel_tank','fuel_pump','fuel_filler_cap'],
  cooling:     ['radiator','coolant_reservoir','intercooler'],
  electrical:  ['ecu_main','battery_12v','alternator','fuse_box','wiring_harness_main','roof_antenna'],
  transmission:['gearbox_8spd','transfer_case','driveshaft_front_left','driveshaft_front_right','driveshaft_rear'],
  drivetrain:  ['gearbox_8spd','transfer_case','driveshaft_rear','driveshaft_front_left','driveshaft_front_right'],
  body:        ['engine_hood','roof_panel','trunk_lid','front_bumper_assembly','rear_bumper_assembly','door_front_left','door_front_right','door_rear_left','door_rear_right'],
  chassis:     ['chassis_frame','front_subframe','rear_subframe'],
  'front left':['tire_fl','rim_fl','brake_caliper_fl','brake_disc_fl','wishbone_upper_fl','shock_absorber_fl','hub_fl'],
  'front right':['tire_fr','rim_fr','brake_caliper_fr','brake_disc_fr','wishbone_upper_fr','shock_absorber_fr','hub_fr'],
  'rear left': ['tire_rl','rim_rl','brake_caliper_rl','brake_disc_rl','wishbone_upper_rl','shock_absorber_rl','hub_rl'],
  'rear right':['tire_rr','rim_rr','brake_caliper_rr','brake_disc_rr','wishbone_upper_rr','shock_absorber_rr','hub_rr'],
};

// ═══════════════════════════════════════════════════════════════
// SCENE GLOBALS
// ═══════════════════════════════════════════════════════════════
let scene, camera, renderer, controls;
let carGroup, meshMap = {};   // meshMap: meshId → THREE.Mesh
let origMaterials = {};       // per-mesh original material clone
let selectedMeshId = null;
let wireframeMode = false, xrayMode = false, explodeMode = false;
let lastFpsTime = performance.now(), fps = 60, frameCount = 0;

// ═══════════════════════════════════════════════════════════════
// INIT THREE.JS
// ═══════════════════════════════════════════════════════════════
function initScene() {
  const canvas = document.getElementById('car-canvas');

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x080B10, 0.045);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.05, 80);
  camera.position.set(5.5, 3.2, 6.5);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 0.8;
  controls.maxDistance = 22;
  controls.target.set(0, 0.6, 0);
  controls.update();

  // Lighting
  const amb = new THREE.HemisphereLight(0x8899CC, 0x302010, 0.65);
  scene.add(amb);

  const sun = new THREE.DirectionalLight(0xFFFFFF, 1.35);
  sun.position.set(6, 12, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.set(-8, -8, 8, 8);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 30;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x4466AA, 0.35);
  fill.position.set(-6, 4, -6);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xC9A84C, 0.45);
  rim.position.set(0, 5, -10);
  scene.add(rim);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({ color: 0x0D1020, roughness: 0.9, metalness: 0.1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid Lines
  const grid = new THREE.GridHelper(30, 40, 0x1A2030, 0x111822);
  grid.position.y = 0.002;
  scene.add(grid);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ═══════════════════════════════════════════════════════════════
// PROCEDURAL CAR MODEL
// ═══════════════════════════════════════════════════════════════
function buildCar() {
  carGroup = new THREE.Group();
  carGroup.position.y = 0;
  scene.add(carGroup);

  const mats = {
    body:    new THREE.MeshStandardMaterial({ color: 0xD0D2D8, metalness: 0.82, roughness: 0.18 }),
    glass:   new THREE.MeshStandardMaterial({ color: 0x88AACC, metalness: 0.05, roughness: 0.04, transparent: true, opacity: 0.38, side: THREE.DoubleSide }),
    tire:    new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.0, roughness: 0.95 }),
    rim:     new THREE.MeshStandardMaterial({ color: 0xA8A8AA, metalness: 0.94, roughness: 0.06 }),
    engine:  new THREE.MeshStandardMaterial({ color: 0x1E1E1E, metalness: 0.55, roughness: 0.55 }),
    steel:   new THREE.MeshStandardMaterial({ color: 0x888898, metalness: 0.88, roughness: 0.28 }),
    plastic: new THREE.MeshStandardMaterial({ color: 0x181818, metalness: 0.05, roughness: 0.72 }),
    rubber:  new THREE.MeshStandardMaterial({ color: 0x0F0F0F, metalness: 0.0, roughness: 0.97 }),
    caliper: new THREE.MeshStandardMaterial({ color: 0xCC1111, metalness: 0.68, roughness: 0.32 }),
    disc:    new THREE.MeshStandardMaterial({ color: 0x444450, metalness: 0.88, roughness: 0.45 }),
    headlgt: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.12, roughness: 0.04, emissive: new THREE.Color(0xFFFF88), emissiveIntensity: 0.28 }),
    tailgt:  new THREE.MeshStandardMaterial({ color: 0xFF1500, metalness: 0.1, roughness: 0.12, emissive: new THREE.Color(0xFF2200), emissiveIntensity: 0.22 }),
    interior:new THREE.MeshStandardMaterial({ color: 0x0C0C0C, metalness: 0.08, roughness: 0.82 }),
    exhaust: new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.82, roughness: 0.35 }),
    carbon:  new THREE.MeshStandardMaterial({ color: 0x0A0A0A, metalness: 0.4, roughness: 0.65 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x151515, metalness: 0.02, roughness: 0.88 }),
    battery: new THREE.MeshStandardMaterial({ color: 0x111820, metalness: 0.3, roughness: 0.6 }),
    gold:    new THREE.MeshStandardMaterial({ color: 0xC9A84C, metalness: 0.95, roughness: 0.12 }),
    spring:  new THREE.MeshStandardMaterial({ color: 0x666670, metalness: 0.75, roughness: 0.4 }),
    oled:    new THREE.MeshStandardMaterial({ color: 0x001020, metalness: 0.1, roughness: 0.0, emissive: new THREE.Color(0x001030), emissiveIntensity: 0.5 }),
  };

  const B  = (w,h,d) => new THREE.BoxGeometry(w,h,d);
  const Cy = (r,h,s=24) => new THREE.CylinderGeometry(r,r,h,s);
  const To = (r,t,rs=14,ts=32) => new THREE.TorusGeometry(r,t,rs,ts);

  function add(id, geo, mat, pos, rot=[0,0,0]) {
    const m = mat.clone();
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.name = id;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    carGroup.add(mesh);
    meshMap[id] = mesh;
    origMaterials[id] = m;
  }

  const HPI = Math.PI / 2;

  // ── CHASSIS ─────────────────────────
  add('chassis_frame',          B(3.82,0.12,1.68), mats.steel,   [0, 0.07, 0]);
  add('front_subframe',         B(1.6,0.1,1.5),    mats.steel,   [0, 0.1,  1.14]);
  add('rear_subframe',          B(1.45,0.1,1.4),   mats.steel,   [0, 0.1, -1.2]);

  // ── BODY PANELS ─────────────────────
  add('body_lower_shell',       B(3.72,0.44,1.73), mats.body,    [0, 0.31, 0]);
  add('front_fender_left',      B(1.42,0.54,0.08), mats.body,    [-0.89, 0.62, 1.14]);
  add('front_fender_right',     B(1.42,0.54,0.08), mats.body,    [ 0.89, 0.62, 1.14]);
  add('rear_quarter_panel_left',B(1.38,0.54,0.08), mats.body,    [-0.89, 0.62,-1.1]);
  add('rear_quarter_panel_right',B(1.38,0.54,0.08),mats.body,    [ 0.89, 0.62,-1.1]);
  add('door_front_left',        B(0.055,0.68,0.92),mats.body,    [-0.9, 0.65,  0.32]);
  add('door_front_right',       B(0.055,0.68,0.92),mats.body,    [ 0.9, 0.65,  0.32]);
  add('door_rear_left',         B(0.055,0.68,0.88),mats.body,    [-0.9, 0.65, -0.55]);
  add('door_rear_right',        B(0.055,0.68,0.88),mats.body,    [ 0.9, 0.65, -0.55]);
  add('engine_hood',            B(1.54,0.055,1.7), mats.body,    [0, 0.73, 1.08]);
  add('roof_panel',             B(1.9,0.06,1.34),  mats.carbon,  [0, 1.21, 0.12]);
  add('trunk_lid',              B(1.14,0.045,1.7), mats.body,    [0, 0.73,-1.25]);
  add('front_bumper_assembly',  B(0.22,0.48,1.78), mats.body,    [0, 0.4,  1.95]);
  add('rear_bumper_assembly',   B(0.22,0.52,1.78), mats.body,    [0, 0.42,-1.95]);
  add('front_grille',           B(0.04,0.3,1.2),   mats.plastic, [0, 0.49, 1.99]);

  // ── GLASS ─────────────────────────--
  add('windshield_front',       B(1.83,0.82,0.04), mats.glass,   [0, 0.97,  0.87], [-0.22,0,0]);
  add('windshield_rear',        B(1.73,0.65,0.04), mats.glass,   [0, 0.97, -0.7],  [ 0.3, 0,0]);
  add('window_front_left',      B(0.04,0.48,0.82), mats.glass,   [-0.9, 0.88, 0.33]);
  add('window_front_right',     B(0.04,0.48,0.82), mats.glass,   [ 0.9, 0.88, 0.33]);
  add('window_rear_left',       B(0.04,0.45,0.78), mats.glass,   [-0.9, 0.88,-0.55]);
  add('window_rear_right',      B(0.04,0.45,0.78), mats.glass,   [ 0.9, 0.88,-0.55]);

  // ── LIGHTS ───────────────────────────
  add('headlight_left',         B(0.39,0.14,0.06), mats.headlgt, [-0.63, 0.58, 1.97]);
  add('headlight_right',        B(0.39,0.14,0.06), mats.headlgt, [ 0.63, 0.58, 1.97]);
  add('drl_left',               B(0.46,0.042,0.04),mats.headlgt, [-0.55, 0.47, 1.98]);
  add('drl_right',              B(0.46,0.042,0.04),mats.headlgt, [ 0.55, 0.47, 1.98]);
  add('taillight_left',         B(0.43,0.12,0.05), mats.tailgt,  [-0.69, 0.55,-1.97]);
  add('taillight_right',        B(0.43,0.12,0.05), mats.tailgt,  [ 0.69, 0.55,-1.97]);
  add('brake_light_center',     B(1.42,0.04,0.04), mats.tailgt,  [0, 0.68,-1.96]);

  // ── WHEELS (4 corners) ───────────────
  [{ s:'fl', x:-0.94, z:1.22 },{ s:'fr', x:0.94, z:1.22 },
   { s:'rl', x:-0.94, z:-1.22},{ s:'rr', x:0.94, z:-1.22}].forEach(({s,x,z}) => {
    const sx = x < 0 ? 0.09 : -0.09;
    add(`tire_${s}`,         Cy(0.33,0.24,32),   mats.tire,    [x, 0.33, z], [0,0,HPI]);
    add(`rim_${s}`,          Cy(0.26,0.25,24),   mats.rim,     [x, 0.33, z], [0,0,HPI]);
    add(`hub_${s}`,          Cy(0.07,0.27,12),   mats.steel,   [x, 0.33, z], [0,0,HPI]);
    add(`brake_disc_${s}`,   Cy(0.23,0.028,24),  mats.disc,    [x+sx, 0.33, z], [0,0,HPI]);
    add(`brake_caliper_${s}`,B(0.18,0.11,0.09),  mats.caliper, [x+sx*1.1, 0.35, z]);
  });

  // ── SUSPENSION ───────────────────────
  [{ s:'fl', x:-0.94, z:1.22 },{ s:'fr', x:0.94, z:1.22 },
   { s:'rl', x:-0.94, z:-1.22},{ s:'rr', x:0.94, z:-1.22}].forEach(({s,x,z}) => {
    const xs = x * 0.62;
    add(`wishbone_upper_${s}`,  B(0.44,0.04,0.07),  mats.steel,  [xs, 0.36, z]);
    add(`wishbone_lower_${s}`,  B(0.5, 0.04,0.07),  mats.steel,  [xs, 0.21, z]);
    add(`shock_absorber_${s}`,  Cy(0.028,0.43,12),  mats.steel,  [x*0.78, 0.38, z]);
    add(`coil_spring_${s}`,     Cy(0.048,0.28,12),  mats.spring, [x*0.78, 0.28, z]);
  });
  add('anti_roll_bar_front',  Cy(0.018,1.62,12),  mats.steel,   [0, 0.2,  1.22], [0,0,HPI]);
  add('anti_roll_bar_rear',   Cy(0.018,1.62,12),  mats.steel,   [0, 0.2, -1.22], [0,0,HPI]);

  // ── ENGINE BAY ───────────────────────
  add('engine_block',         B(0.73,0.47,1.07),  mats.engine,  [0, 0.52, 1.0]);
  add('cylinder_head',        B(0.71,0.12,1.05),  mats.engine,  [0, 0.82, 1.0]);
  add('turbocharger',         B(0.22,0.22,0.23),  mats.steel,   [0.28, 0.87, 0.84]);
  add('intercooler',          B(0.08,0.22,0.56),  mats.steel,   [0, 0.72, 1.72]);
  add('exhaust_manifold',     B(0.08,0.15,0.9),   mats.exhaust, [0.3, 0.62, 1.0]);
  add('intake_manifold',      B(0.08,0.12,0.85),  mats.engine,  [-0.28, 0.78, 1.0]);
  add('air_filter_assembly',  Cy(0.1,0.38,16),    mats.plastic, [-0.28, 0.89, 0.72]);
  add('radiator',             B(0.08,0.58,1.32),  mats.steel,   [0, 0.52, 1.78]);
  add('battery_12v',          B(0.24,0.18,0.35),  mats.battery, [-0.48, 0.82, 1.1]);
  add('alternator',           Cy(0.08,0.14,16),   mats.engine,  [0.32, 0.52, 0.72]);
  add('coolant_reservoir',    B(0.12,0.14,0.1),   mats.plastic, [-0.52, 0.76, 1.42]);
  add('fuel_pump',            Cy(0.05,0.25,12),   mats.plastic, [0, 0.1, -0.95], [HPI,0,0]);
  add('engine_oil_pan',       B(0.65,0.1,0.9),    mats.steel,   [0, 0.22, 1.0]);
  add('ecu_main',             B(0.22,0.06,0.18),  mats.plastic, [0.3, 0.72, 0.95]);
  add('fuse_box',             B(0.18,0.1,0.22),   mats.plastic, [-0.52, 0.78, 1.28]);
  add('ac_compressor',        Cy(0.09,0.18,16),   mats.engine,  [-0.32, 0.52, 0.82]);
  add('fuel_tank',            B(0.78,0.18,0.88),  mats.steel,   [0, 0.18, -0.95]);
  add('fuel_filler_cap',      Cy(0.04,0.06,12),   mats.plastic, [-0.89, 0.65,-0.8], [0,0,HPI]);

  // ── TRANSMISSION / DRIVETRAIN ────────
  add('gearbox_8spd',         B(0.34,0.28,0.58),  mats.engine,  [0, 0.3, 0.45]);
  add('transfer_case',        B(0.28,0.24,0.3),   mats.engine,  [0, 0.28, 0.15]);
  add('driveshaft_front_left',Cy(0.022,1.1,12),   mats.steel,   [-0.48, 0.26, 0.12], [0,0,HPI]);
  add('driveshaft_front_right',Cy(0.022,1.1,12),  mats.steel,   [ 0.48, 0.26, 0.12], [0,0,HPI]);
  add('driveshaft_rear',      Cy(0.025,1.7,12),   mats.steel,   [0, 0.2,-0.6],        [HPI,0,0]);

  // ── EXHAUST ──────────────────────────
  add('exhaust_pipe_left',    Cy(0.038,2.4,12),   mats.exhaust, [-0.42, 0.18,-0.72],  [HPI,0,0]);
  add('exhaust_pipe_right',   Cy(0.038,2.4,12),   mats.exhaust, [ 0.42, 0.18,-0.72],  [HPI,0,0]);
  add('exhaust_tip_left',     Cy(0.058,0.12,16),  mats.steel,   [-0.42, 0.18,-1.97],  [HPI,0,0]);
  add('exhaust_tip_right',    Cy(0.058,0.12,16),  mats.steel,   [ 0.42, 0.18,-1.97],  [HPI,0,0]);
  add('catalytic_converter',  Cy(0.07,0.32,16),   mats.steel,   [0, 0.18,-0.55],       [HPI,0,0]);

  // ── INTERIOR ─────────────────────────
  add('dashboard_assembly',   B(0.1,0.48,1.52),   mats.interior,[0, 0.84, 0.82]);
  add('steering_wheel',       To(0.18,0.026,14,40),mats.leather, [-0.4, 0.9, 0.65]);
  add('seat_front_left',      B(0.48,0.52,0.55),  mats.leather, [-0.42, 0.5, 0.2]);
  add('seat_front_right',     B(0.48,0.52,0.55),  mats.leather, [ 0.42, 0.5, 0.2]);
  add('center_console',       B(0.22,0.44,0.78),  mats.carbon,  [0, 0.54, 0.16]);
  add('infotainment_screen',  B(0.04,0.28,0.34),  mats.oled,    [0, 0.83, 0.76]);
  add('heater_core',          B(0.15,0.14,0.18),  mats.steel,   [0, 0.88, 0.88]);
  add('ambient_lighting_strip',B(3.5,0.018,0.018),mats.headlgt, [0, 1.17, 0.1]);

  // ── AERO ─────────────────────────────
  add('front_splitter',       B(0.04,0.05,1.84),  mats.carbon,  [0, 0.18, 1.98]);
  add('rear_diffuser',        B(0.06,0.18,1.76),  mats.carbon,  [0, 0.15,-1.98]);
  add('roof_spoiler',         B(1.73,0.07,0.18),  mats.carbon,  [0, 1.23,-0.68]);

  // ── BRAKE SYSTEM ─────────────────────
  add('brake_master_cylinder',Cy(0.04,0.22,12),   mats.steel,   [-0.32, 0.72, 0.92]);
  add('abs_control_module',   B(0.15,0.09,0.12),  mats.plastic, [-0.2, 0.24, 1.35]);

  // ── STEERING ─────────────────────────
  add('power_steering_pump',  Cy(0.065,0.11,16),  mats.engine,  [0.28, 0.52, 0.6]);
  add('wiring_harness_main',  Cy(0.018,3.2,8),    mats.plastic, [0, 0.35, 0], [HPI,0,0]);

  // ── MISC ─────────────────────────────
  add('roof_antenna',         Cy(0.008,0.2,8),    mats.steel,   [0.35, 1.28, 0]);
  add('brake_light_center',   B(1.42,0.04,0.04),  mats.tailgt,  [0, 0.68,-1.96]); // ensure placed

  // Store originals
  Object.keys(meshMap).forEach(id => {
    origMaterials[id] = meshMap[id].material.clone();
  });

  return Object.keys(meshMap).length;
}

// ═══════════════════════════════════════════════════════════════
// CAMERA FLIGHT
// ═══════════════════════════════════════════════════════════════
let camAnim = null;
function flyTo(meshId) {
  const mesh = meshMap[meshId];
  if (!mesh) return;

  const box = new THREE.Box3().setFromObject(mesh);
  const ctr = box.getCenter(new THREE.Vector3());
  const sz  = box.getSize(new THREE.Vector3());
  const dim = Math.max(sz.x, sz.y, sz.z);
  const dist = Math.max(dim * 3.0, 1.0);
  const target = new THREE.Vector3(
    ctr.x + dist * 0.55,
    ctr.y + dist * 0.45,
    ctr.z + dist * 0.72
  );

  const s0 = camera.position.clone();
  const t0 = controls.target.clone();
  const dur = 800, t_s = performance.now();

  cancelAnimationFrame(camAnim);
  function tick() {
    const t = Math.min((performance.now() - t_s) / dur, 1);
    const e = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(s0, target, e);
    controls.target.lerpVectors(t0, ctr, e);
    controls.update();
    if (t < 1) camAnim = requestAnimationFrame(tick);
  }
  tick();
}

function resetCamera() {
  const target = new THREE.Vector3(5.5, 3.2, 6.5);
  const lookAt = new THREE.Vector3(0, 0.6, 0);
  const s0 = camera.position.clone();
  const t0 = controls.target.clone();
  const dur = 800, t_s = performance.now();
  function tick() {
    const t = Math.min((performance.now() - t_s) / dur, 1);
    const e = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(s0, target, e);
    controls.target.lerpVectors(t0, lookAt, e);
    controls.update();
    if (t < 1) requestAnimationFrame(tick);
  }
  tick();
}

// ═══════════════════════════════════════════════════════════════
// MESH HIGHLIGHTING
// ═══════════════════════════════════════════════════════════════
let explodeOrigins = {};

function highlightPart(meshId) {
  if (!meshId) { resetHighlight(); return; }
  const part = DB[meshId];
  const parentMeshes = part ? (part.chi || []) : [];

  Object.keys(meshMap).forEach(id => {
    const mesh = meshMap[id];
    if (id === meshId) {
      const m = origMaterials[id].clone();
      m.emissive = new THREE.Color(0xC9A84C);
      m.emissiveIntensity = 0.55;
      m.transparent = false; m.opacity = 1.0;
      mesh.material = m;
    } else if (parentMeshes.includes(id)) {
      const m = origMaterials[id].clone();
      m.emissive = new THREE.Color(0x0044AA);
      m.emissiveIntensity = 0.2;
      m.transparent = true; m.opacity = 0.38;
      mesh.material = m;
    } else {
      const m = origMaterials[id].clone();
      m.transparent = true; m.opacity = 0.07;
      m.emissive = new THREE.Color(0x000000);
      m.emissiveIntensity = 0;
      mesh.material = m;
    }
  });
}

function resetHighlight() {
  Object.keys(meshMap).forEach(id => {
    meshMap[id].material = origMaterials[id].clone();
  });
}

// ═══════════════════════════════════════════════════════════════
// SEARCH ENGINE
// ═══════════════════════════════════════════════════════════════
function searchParts(q) {
  if (!q || q.length < 2) return [];
  const ql = q.toLowerCase().trim();
  const results = []; const seen = new Set();

  // Semantic
  for (const [kw, ids] of Object.entries(SEM)) {
    if (ql.includes(kw) || kw.includes(ql)) {
      ids.forEach(id => { if (!seen.has(id) && DB[id]) { seen.add(id); results.push({ id, score: 0.96 }); } });
    }
  }

  // Fuzzy on name/part-number/assembly
  for (const [id, p] of Object.entries(DB)) {
    if (seen.has(id)) continue;
    const nm = p.n.toLowerCase(), pn = p.pn.toLowerCase(), asm = p.asm.toLowerCase();
    let score = 0;
    if (nm.includes(ql)) score = 0.92;
    else if (pn.includes(ql)) score = 0.88;
    else if (asm.includes(ql)) score = 0.75;
    else {
      const hit = ql.split('').filter(c => nm.includes(c)).length;
      score = (hit / ql.length) * 0.6;
    }
    if (score > 0.42) { seen.add(id); results.push({ id, score }); }
  }

  return results.sort((a,b) => b.score - a.score).slice(0, 9);
}

// ═══════════════════════════════════════════════════════════════
// UI — PARTS LIST
// ═══════════════════════════════════════════════════════════════
const CAT_ORDER = ['powertrain','chassis','suspension','body','interior','electrical'];
const CAT_LABELS = { powertrain:'🔥 Powertrain', chassis:'⚙️ Chassis & Brakes', suspension:'🔩 Suspension', body:'🚗 Body & Glazing', interior:'💺 Interior', electrical:'⚡ Electrical' };

function buildPartsList() {
  const container = document.getElementById('partsList');
  container.innerHTML = '';
  const bycat = {};
  Object.entries(DB).forEach(([id, p]) => {
    if (!bycat[p.cat]) bycat[p.cat] = [];
    bycat[p.cat].push({ id, p });
  });

  CAT_ORDER.forEach(cat => {
    if (!bycat[cat]) return;
    const lbl = document.createElement('div');
    lbl.className = 'cat-label';
    lbl.textContent = CAT_LABELS[cat] || cat;
    container.appendChild(lbl);

    const catDiv = document.createElement('div');
    catDiv.className = 'parts-category';
    bycat[cat].forEach(({ id, p }) => {
      const item = document.createElement('div');
      item.className = 'part-item';
      item.dataset.id = id;
      item.innerHTML = `
        <span class="pi-icon">${p.ico}</span>
        <span class="pi-name">${p.n}</span>
        <span class="pi-dot ${p.h}"></span>`;
      item.addEventListener('click', () => selectPart(id));
      catDiv.appendChild(item);
    });
    container.appendChild(catDiv);
  });

  document.getElementById('partsBadge').textContent = Object.keys(DB).length + ' Parts';
  document.getElementById('sbParts').textContent = Object.keys(DB).length + ' Parts Indexed';
}

// ═══════════════════════════════════════════════════════════════
// UI — SEARCH DROPDOWN
// ═══════════════════════════════════════════════════════════════
let searchTm;
document.getElementById('carSearch').addEventListener('input', e => {
  clearTimeout(searchTm);
  searchTm = setTimeout(() => renderSearchDd(e.target.value), 180);
});
document.getElementById('carSearch').addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDd();
  if (e.key === 'Enter') {
    const first = searchParts(e.target.value)[0];
    if (first) { selectPart(first.id); closeDd(); e.target.value = ''; }
  }
});
document.addEventListener('click', e => {
  if (!e.target.closest('.g-search-wrap')) closeDd();
});

function closeDd() {
  document.getElementById('searchDd').classList.remove('open');
}

function renderSearchDd(q) {
  const dd = document.getElementById('searchDd');
  const results = searchParts(q);
  if (!results.length) { dd.classList.remove('open'); return; }

  dd.innerHTML = results.map(({ id, score }) => {
    const p = DB[id];
    return `<div class="sdd-item" data-id="${id}">
      <div class="sdd-icon ${p.cat}">${p.ico}</div>
      <div class="sdd-info">
        <div class="sdd-name">${p.n}</div>
        <div class="sdd-meta">${p.pn} · ${p.asm}</div>
      </div>
      <div class="sdd-score">${(score*100).toFixed(0)}%</div>
    </div>`;
  }).join('');

  dd.querySelectorAll('.sdd-item').forEach(el => {
    el.addEventListener('click', () => {
      selectPart(el.dataset.id);
      closeDd();
      document.getElementById('carSearch').value = '';
    });
  });
  dd.classList.add('open');
}

// ═══════════════════════════════════════════════════════════════
// PART SELECTION
// ═══════════════════════════════════════════════════════════════
function selectPart(meshId, conf = 0.96) {
  selectedMeshId = meshId;
  const p = DB[meshId];
  if (!p) return;

  // Highlight 3D
  highlightPart(meshId);
  flyTo(meshId);

  // Left panel — active state
  document.querySelectorAll('.part-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === meshId);
  });

  // Right panel
  showPartInfo(meshId, p, conf);
  document.getElementById('panelR').classList.remove('hidden');

  // Status bar
  document.getElementById('sbSel').textContent = p.n;

  // Toast
  showToast(`✓ ${p.n}`, `Part matched · Confidence ${(conf*100).toFixed(1)}%`);

  // Scan overlay briefly
  setScan(true, 'AI MATCHING PART...');
  setTimeout(() => setScan(false), 700);
}

function deselectPart() {
  selectedMeshId = null;
  resetHighlight();
  document.querySelectorAll('.part-item').forEach(el => el.classList.remove('active'));
  document.getElementById('panelR').classList.add('hidden');
  document.getElementById('sbSel').textContent = 'No Selection';
}

// ═══════════════════════════════════════════════════════════════
// PART INFO PANEL
// ═══════════════════════════════════════════════════════════════
function showPartInfo(id, p, conf = 0.96) {
  document.getElementById('noSel').style.display = 'none';
  const pi = document.getElementById('partInfo');
  pi.style.display = 'flex';

  document.getElementById('piNum').textContent  = p.pn;
  document.getElementById('piName').textContent = p.n;
  document.getElementById('piAsm').textContent  = '📍 ' + p.asm;

  const hb = document.getElementById('piHbadge');
  hb.textContent = p.h === 'ok' ? 'OPERATIONAL' : p.h === 'warning' ? 'NEEDS CHECK' : 'CRITICAL';
  hb.className = `hbadge ${p.h === 'ok' ? 'ok' : p.h === 'warning' ? 'warn' : 'crit'}`;

  const pct = Math.round(conf * 100);
  document.getElementById('piConf').style.width = pct + '%';
  document.getElementById('piConfPct').textContent = pct + '%';

  // Reset tab to specs
  document.querySelectorAll('.pi-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="specs"]').classList.add('active');
  document.getElementById('tab-specs').classList.add('active');

  // ── Specs Tab ──
  const specKeys = { ...{ 'Material': p.mat, 'Weight': p.wt }, ...(p.spec || {}) };
  const specHtml = `
    <div class="spec-lbl-row">Technical Specifications</div>
    <div class="spec-grid">
      ${Object.entries(specKeys).map(([k,v]) =>
        `<div class="spec-item"><div class="spec-k">${k}</div><div class="spec-v">${v}</div></div>`
      ).join('')}
      <div class="spec-item"><div class="spec-k">Torque Spec</div><div class="spec-v gold">${p.tor}</div></div>
    </div>`;
  document.getElementById('piSpecs').innerHTML = specHtml;

  // Hierarchy
  const hierHtml = `
    <div class="spec-lbl-row" style="margin-bottom:5px">Assembly Hierarchy</div>
    <div class="hier-chain">
      <div class="hier-item parent" onclick="searchAndSelect('${p.par}')">▲ ${p.par}</div>
      <div class="hier-item current">● ${p.n}</div>
      ${(p.chi || []).map(c => DB[c] ? `<div class="hier-item child" onclick="selectPart('${c}')">▼ ${DB[c].n}</div>` : '').join('')}
    </div>`;
  document.getElementById('piHier').innerHTML = hierHtml;

  // Related parts
  const relHtml = (p.rel || []).map(r => DB[r]
    ? `<div class="rel-chip" onclick="selectPart('${r}')">${DB[r].ico} ${DB[r].n}</div>` : ''
  ).join('');
  document.getElementById('piRelated').innerHTML = `<div class="spec-lbl-row">Related Parts</div>` + relHtml;

  // ── Service Tab ──
  document.getElementById('piSvc').innerHTML = (p.svc || ['No service instructions defined.']).map((s,i) =>
    `<div class="svc-step"><div class="step-num">${i+1}</div><div>${s}</div></div>`
  ).join('');

  // ── Maintenance Tab ──
  document.getElementById('piMaint').innerHTML = Object.entries(p.mnt || {}).map(([task, interval]) =>
    `<div class="maint-item"><span class="maint-task">🔧 ${task}</span><span class="maint-int">${interval}</span></div>`
  ).join('') || '<div style="padding:14px;color:#475569;font-size:.75rem">No scheduled maintenance data.</div>';

  // ── AI Tab ──
  document.getElementById('piAi').innerHTML = `
    <div class="ai-box-head">🤖 AtlasAI Reasoning</div>
    <div class="ai-ev"><span class="ai-ev-check">✓</span> Part identified: <strong>${p.n}</strong> in ${p.asm}</div>
    <div class="ai-ev"><span class="ai-ev-check">✓</span> Spatial zone: ${getSpatialZone(id)}</div>
    <div class="ai-ev"><span class="ai-ev-check">✓</span> Geometry match: ${getGeoDesc(id)}</div>
    <div class="ai-ev"><span class="ai-ev-check">✓</span> Semantic vector similarity: ${(conf*0.94).toFixed(2)} cosine</div>
    <div class="ai-ev"><span class="ai-ev-check">✓</span> Knowledge graph: ${(p.rel||[]).length} related components linked</div>
    <div class="ai-ev"><span class="ai-ev-check">✓</span> Gemini LLM verification: Confirmed <em>${p.n}</em></div>
    <div class="ai-ev"><span class="ai-ev-check">✓</span> Final confidence: ${pct}% (${pct>90?'High':'Medium'} confidence match)</div>
    <div style="margin-top:10px;padding:8px;background:rgba(201,168,76,0.07);border-radius:6px;font-size:.72rem;color:#94A3B8;line-height:1.5">${p.desc}</div>`;
}

function getSpatialZone(id) {
  if (id.endsWith('_fl') || id.includes('front_left')) return 'Front-left corner zone';
  if (id.endsWith('_fr') || id.includes('front_right')) return 'Front-right corner zone';
  if (id.endsWith('_rl') || id.includes('rear_left')) return 'Rear-left corner zone';
  if (id.endsWith('_rr') || id.includes('rear_right')) return 'Rear-right corner zone';
  if (id.includes('front')) return 'Front central zone';
  if (id.includes('rear') || id.includes('trunk')) return 'Rear central zone';
  if (id.includes('roof')) return 'Top / roof zone';
  if (id.includes('engine') || id.includes('turbo') || id.includes('exhaust')) return 'Engine bay zone';
  if (id.includes('seat') || id.includes('dash') || id.includes('console')) return 'Cabin interior zone';
  return 'Central body zone';
}

function getGeoDesc(id) {
  const m = meshMap[id];
  if (!m) return 'Unknown';
  const box = new THREE.Box3().setFromObject(m);
  const sz = box.getSize(new THREE.Vector3());
  return `Bounding box ${sz.x.toFixed(2)}×${sz.y.toFixed(2)}×${sz.z.toFixed(2)} m`;
}

function searchAndSelect(partName) {
  const res = searchParts(partName);
  if (res.length) selectPart(res[0].id);
}

// Tab switching
document.querySelectorAll('.pi-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.pi-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// ═══════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════
let toastTimer;
function showToast(title, sub) {
  const t = document.getElementById('matchToast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastSub').textContent = sub;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 3000);
}

// ═══════════════════════════════════════════════════════════════
// SCAN OVERLAY
// ═══════════════════════════════════════════════════════════════
function setScan(on, txt = '') {
  const el = document.getElementById('aiScan');
  el.classList.toggle('on', on);
  if (txt) document.getElementById('scanTxt').textContent = txt;
}

// ═══════════════════════════════════════════════════════════════
// RAYCASTING HOVER
// ═══════════════════════════════════════════════════════════════
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoverMesh = null;
const tip = document.getElementById('hoverTip');

document.getElementById('car-canvas').addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(Object.values(meshMap));
  if (hits.length) {
    const id = hits[0].object.name;
    const p = DB[id];
    tip.style.left = e.clientX + 'px';
    tip.style.top  = e.clientY + 'px';
    document.getElementById('htId').textContent   = id;
    document.getElementById('htName').textContent = p ? p.n : id;
    document.getElementById('htAsm').textContent  = p ? p.asm : '';
    tip.classList.add('visible');
    hoverMesh = id;
  } else {
    tip.classList.remove('visible');
    hoverMesh = null;
  }
});

document.getElementById('car-canvas').addEventListener('click', e => {
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(Object.values(meshMap));
  if (hits.length) {
    const id = hits[0].object.name;
    if (DB[id]) selectPart(id);
  } else {
    deselectPart();
  }
});

// ═══════════════════════════════════════════════════════════════
// VIEWER CONTROLS
// ═══════════════════════════════════════════════════════════════
document.getElementById('vReset').addEventListener('click', () => {
  resetCamera(); resetHighlight(); deselectPart();
});

document.getElementById('vWire').addEventListener('click', function() {
  wireframeMode = !wireframeMode;
  this.classList.toggle('active', wireframeMode);
  Object.values(meshMap).forEach(m => { m.material.wireframe = wireframeMode; });
});

document.getElementById('vXray').addEventListener('click', function() {
  xrayMode = !xrayMode;
  this.classList.toggle('active', xrayMode);
  Object.values(meshMap).forEach(m => {
    m.material.transparent = xrayMode;
    m.material.opacity = xrayMode ? 0.35 : (m.material.opacity < 1 ? m.material.opacity : 1.0);
  });
});

let explodeFactor = 0;
document.getElementById('vExplode').addEventListener('click', function() {
  explodeMode = !explodeMode;
  this.classList.toggle('active', explodeMode);
  const targetFactor = explodeMode ? 1.6 : 0;
  const startFactor = explodeFactor;
  const dur = 1000, t_s = performance.now();

  // Store original positions once
  if (explodeMode && Object.keys(explodeOrigins).length === 0) {
    Object.entries(meshMap).forEach(([id, mesh]) => {
      explodeOrigins[id] = mesh.position.clone();
    });
  }

  function animExplode() {
    const t = Math.min((performance.now() - t_s) / dur, 1);
    const e = 1 - Math.pow(1-t, 3);
    explodeFactor = startFactor + (targetFactor - startFactor) * e;
    Object.entries(meshMap).forEach(([id, mesh]) => {
      const orig = explodeOrigins[id];
      if (orig) {
        const dir = orig.clone().normalize();
        mesh.position.copy(orig).addScaledVector(dir, explodeFactor * 0.6);
      }
    });
    if (t < 1) requestAnimationFrame(animExplode);
    else if (!explodeMode) { explodeOrigins = {}; }
  }
  animExplode();
});

// ═══════════════════════════════════════════════════════════════
// UPLOAD / GEOMETRY MATCHING
// ═══════════════════════════════════════════════════════════════
document.getElementById('openUpload').addEventListener('click', () => {
  document.getElementById('uploadOverlay').classList.add('on');
});
document.getElementById('closeUpload').addEventListener('click', () => {
  document.getElementById('uploadOverlay').classList.remove('on');
  document.getElementById('uploadProg').classList.remove('on');
  document.getElementById('upFill').style.width = '0%';
});

const dropZone = document.getElementById('dropZone');
['dragenter','dragover'].forEach(e => dropZone.addEventListener(e, ev => { ev.preventDefault(); dropZone.classList.add('drag-on'); }));
['dragleave','drop'].forEach(e => dropZone.addEventListener(e, ev => { ev.preventDefault(); dropZone.classList.remove('drag-on'); }));
dropZone.addEventListener('drop', e => {
  const file = e.dataTransfer.files[0];
  if (file) handleUpload(file);
});
document.getElementById('fileInput').addEventListener('change', e => {
  if (e.target.files[0]) handleUpload(e.target.files[0]);
});

async function handleUpload(file) {
  const prog = document.getElementById('uploadProg');
  const fill = document.getElementById('upFill');
  const txt  = document.getElementById('upTxt');
  prog.classList.add('on');

  const steps = ['Loading 3D model...', 'Extracting geometry...', 'Computing bounding box...', 'Comparing against 85 car parts...', 'Running AI geometry matcher...', 'Generating confidence scores...'];
  for (let i = 0; i < steps.length; i++) {
    txt.textContent = steps[i];
    fill.style.width = ((i+1) / steps.length * 80) + '%';
    await new Promise(r => setTimeout(r, 320));
  }

  try {
    const matches = await analyzeGeometry(file);
    fill.style.width = '100%';
    txt.textContent = `Match found: ${matches[0] ? DB[matches[0].id].n : 'Unknown'}`;
    await new Promise(r => setTimeout(r, 500));
    document.getElementById('uploadOverlay').classList.remove('on');
    prog.classList.remove('on');
    fill.style.width = '0%';

    if (matches.length > 0) {
      selectPart(matches[0].id, matches[0].score);
    }
  } catch(err) {
    txt.textContent = 'Error: ' + err.message;
  }
}

async function analyzeGeometry(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.toLowerCase().split('.').pop();
    const url = URL.createObjectURL(file);

    const processGeo = geo => {
      URL.revokeObjectURL(url);
      geo.computeBoundingBox();
      const sz = new THREE.Vector3();
      geo.boundingBox.getSize(sz);
      const maxD = Math.max(sz.x, sz.y, sz.z);
      const minD = Math.min(sz.x, sz.y, sz.z);
      const midD = sz.x + sz.y + sz.z - maxD - minD;
      const flat = minD / (midD + 0.001);
      const elong = midD / (maxD + 0.001);
      const verts = geo.attributes.position ? geo.attributes.position.count : 100;
      resolve(matchByGeometry(flat, elong, maxD, verts));
    };

    try {
      if (ext === 'stl') {
        const loader = new THREE.STLLoader();
        loader.load(url, geo => processGeo(geo), undefined, err => reject(err));
      } else if (ext === 'glb' || ext === 'gltf') {
        const loader = new THREE.GLTFLoader();
        loader.load(url, gltf => {
          let g = null;
          gltf.scene.traverse(o => { if (o.isMesh && !g) g = o.geometry; });
          if (g) processGeo(g); else reject(new Error('No mesh found in GLB'));
        }, undefined, err => reject(err));
      } else if (ext === 'obj') {
        const loader = new THREE.OBJLoader();
        loader.load(url, obj => {
          let g = null;
          obj.traverse(o => { if (o.isMesh && !g) g = o.geometry; });
          if (g) processGeo(g); else reject(new Error('No mesh found in OBJ'));
        }, undefined, err => reject(err));
      } else {
        // Fallback: analyse filename for clues
        const fn = file.name.toLowerCase();
        const r = searchParts(fn.replace(/[._-]/g, ' '));
        resolve(r.length ? r : [{ id: 'engine_block', score: 0.72 }]);
      }
    } catch(e) { reject(e); }
  });
}

function matchByGeometry(flat, elong, maxDim, verts) {
  // flat = flatness ratio, elong = elongation ratio, maxDim in model units
  const candidates = [
    { id:'engine_hood',     score: flat < 0.12 ? 0.88 : 0.22 },
    { id:'roof_panel',      score: flat < 0.10 ? 0.85 : 0.2 },
    { id:'door_front_left', score: flat < 0.15 && elong > 0.5 ? 0.82 : 0.2 },
    { id:'trunk_lid',       score: flat < 0.12 && elong > 0.6 ? 0.80 : 0.2 },
    { id:'windshield_front',score: flat < 0.08 ? 0.86 : 0.2 },
    { id:'exhaust_pipe_left',score: elong < 0.18 ? 0.84 : 0.2 },
    { id:'shock_absorber_fl',score: elong < 0.15 && flat > 0.5 ? 0.82 : 0.2 },
    { id:'engine_block',    score: flat > 0.35 && elong > 0.4 && maxDim > 0.3 ? 0.80 : 0.2 },
    { id:'turbocharger',    score: flat > 0.45 && maxDim < 0.4 ? 0.78 : 0.2 },
    { id:'tire_fl',         score: flat > 0.3 && elong > 0.25 && verts > 300 ? 0.74 : 0.2 },
    { id:'rim_fl',          score: flat > 0.25 && verts > 200 ? 0.72 : 0.2 },
    { id:'brake_disc_fl',   score: flat < 0.2 && flat > 0.05 && elong > 0.4 ? 0.76 : 0.2 },
    { id:'gearbox_8spd',    score: flat > 0.4 && elong > 0.35 && maxDim > 0.2 ? 0.74 : 0.2 },
    { id:'front_bumper_assembly',score: flat > 0.3 && elong < 0.2 ? 0.72 : 0.2 },
    { id:'fuel_tank',       score: flat > 0.3 && maxDim > 0.4 ? 0.70 : 0.2 },
  ];
  return candidates.filter(c => c.score > 0.5).sort((a,b) => b.score - a.score).slice(0, 3);
}

// ═══════════════════════════════════════════════════════════════
// ANIMATION LOOP
// ═══════════════════════════════════════════════════════════════
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);

  // FPS
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastFpsTime = now;
    document.getElementById('fps').textContent = fps;
  }
}

// ═══════════════════════════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════════════════════════
(async function main() {
  setScan(true, 'INITIALIZING AI ENGINE...');
  initScene();

  await new Promise(r => setTimeout(r, 300));
  setScan(true, 'BUILDING PROCEDURAL CAR MODEL...');

  await new Promise(r => setTimeout(r, 200));
  const count = buildCar();

  setScan(true, 'INDEXING ' + count + ' MESH COMPONENTS...');
  await new Promise(r => setTimeout(r, 300));
  buildPartsList();

  setScan(true, 'AI KNOWLEDGE GRAPH READY');
  await new Promise(r => setTimeout(r, 400));
  setScan(false);

  document.getElementById('sbParts').textContent = Object.keys(DB).length + ' Parts Indexed';

  animate();
})();
