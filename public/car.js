/* ================================================================
   car.js  —  AtlasAI Automotive Digital Twin Engine v2.1
   Procedural BMW M4 · MeshPhongMaterial · Strong lighting
   ================================================================ */
'use strict';

// ═══════════════════════════════════════════════════════════════
// PARTS DATABASE (85 parts)
// ═══════════════════════════════════════════════════════════════
const DB = {
  chassis_frame:          {n:'CLAR Chassis Frame',cat:'chassis',asm:'Chassis',mat:'UHSS/CFRP/Aluminium',wt:'480 kg',h:'ok',ico:'🏗️',pn:'CHS-CLAR-M4-001',desc:'BMW CLAR mixed-material chassis. 40% ultra-high-strength steel, 20% CFRP.',svc:['Chassis repairs require BMW factory approval','Post-repair structural scan mandatory','Corrosion protection re-application after any weld'],mnt:{'Corrosion Inspection':'Every 3 years','Structural Scan':'After any collision'},spec:{Rigidity:'37,000 Nm/deg',Torsion:'42,000 Nm/deg',NCAP:'5 Stars',Length:'4794 mm'},tor:'Various',rel:['front_subframe','rear_subframe'],par:'Vehicle Structure',chi:['front_subframe','rear_subframe']},
  front_subframe:         {n:'Front Subframe',cat:'chassis',asm:'Chassis',mat:'Aluminium 6061',wt:'18 kg',h:'ok',ico:'🔩',pn:'CHS-SFNT-M4-001',desc:'Cast aluminium front subframe. Mounts engine and steering.',svc:['Remove front suspension','Disconnect steering rack','Remove 6 bolts M12 90 Nm'],mnt:{'Inspection':'Every 40,000 km'},spec:{Material:'Al 6061-T6',Bolts:'6x M12'},tor:'90 Nm',rel:['chassis_frame','wishbone_upper_fl'],par:'Chassis Frame',chi:[]},
  rear_subframe:          {n:'Rear Subframe',cat:'chassis',asm:'Chassis',mat:'Steel/Al Hybrid',wt:'22 kg',h:'ok',ico:'🔩',pn:'CHS-SRNT-M4-001',desc:'Rear integral-link subframe. Supports rear axle and differential.',svc:['Lower with jack stands','Disconnect driveshaft','Remove 8 bolts M14 120 Nm'],mnt:{'Inspection':'Every 60,000 km'},spec:{Material:'Steel+Al',Bolts:'8x M14'},tor:'120 Nm',rel:['chassis_frame','wishbone_upper_rl'],par:'Chassis Frame',chi:[]},
  body_lower_shell:       {n:'Body Lower Shell',cat:'body',asm:'Body',mat:'High-Strength Steel',wt:'62 kg',h:'ok',ico:'🚗',pn:'BDY-LOW-M4-001',desc:'Lower body sill and rocker panel assembly with door hinge reinforcements.',svc:['Section welding only','Use OEM replacement sections','Corrosion treatment required'],mnt:{'Paint/Rust Inspection':'Annual'},spec:{Steel:'590 MPa HSLA',Coating:'E-coat'},tor:'N/A (welded)',rel:['chassis_frame','door_front_left'],par:'Body Assembly',chi:[]},
  engine_hood:            {n:'Engine Hood (CFRP)',cat:'body',asm:'Body',mat:'Carbon Fibre Reinforced Polymer',wt:'8.5 kg',h:'ok',ico:'🚗',pn:'BDY-HOOD-M4-CF',desc:'Lightweight CFRP engine hood with dual functional vents. 40% lighter than steel.',svc:['Mark hinge position before removal','Remove 4 hinge bolts M8 20 Nm with assistant','Align to 4.5mm body gap on reinstall'],mnt:{'Hinge Lubrication':'Every 2 years'},spec:{Material:'CFRP 3K',Weight:'8.5 kg',Gap:'4.5 mm'},tor:'20 Nm hinge bolts',rel:['front_fender_left','front_bumper_assembly'],par:'Body Assembly',chi:[]},
  roof_panel:             {n:'Roof Panel (Carbon Fibre)',cat:'body',asm:'Body',mat:'CFRP 3K Twill',wt:'6.8 kg',h:'ok',ico:'📐',pn:'BDY-ROOF-CF-M4',desc:'Visible CFRP roof. Lowers CoG by 14mm. UV-sealed clear coat.',svc:['Specialist bonding required','Use SikaPower-498 adhesive','24h cure'],mnt:{'UV Sealant':'Every 2 years'},spec:{Material:'CFRP 3K',Weight:'6.8 kg',Thickness:'3.2 mm'},tor:'N/A (bonded)',rel:['windshield_front','windshield_rear'],par:'Body Assembly',chi:[]},
  trunk_lid:              {n:'Trunk Lid',cat:'body',asm:'Body',mat:'Aluminium 6016',wt:'12.3 kg',h:'ok',ico:'🚪',pn:'BDY-TRNK-M4-001',desc:'Aluminium trunk lid with integrated lip spoiler.',svc:['Disconnect wiring harness','Mark hinge position','Remove 4 hinge bolts M8 22 Nm'],mnt:{'Gas Strut Check':'Every 3 years'},spec:{Material:'Al 6016-T4',Gap:'4.0 mm'},tor:'22 Nm hinge bolts',rel:['roof_panel','rear_bumper_assembly'],par:'Body Assembly',chi:['roof_spoiler']},
  front_bumper_assembly:  {n:'Front Bumper Assembly',cat:'body',asm:'Body',mat:'CFRP / PP-GF30',wt:'9.2 kg',h:'ok',ico:'🚗',pn:'BDY-FBMP-CF-M4',desc:'M4 Competition front bumper with large kidney grille and ACC radar.',svc:['Remove wheel arch liners','Disconnect PDC/ACC connectors','Pull bumper forward'],mnt:{'Radar Alignment':'After any impact'},spec:{Material:'CFRP',ACC_Radar:'Integrated'},tor:'Clip pins hand tight',rel:['headlight_left','headlight_right','front_splitter'],par:'Body Assembly',chi:['headlight_left','headlight_right']},
  rear_bumper_assembly:   {n:'Rear Bumper Assembly',cat:'body',asm:'Body',mat:'CFRP / PP-GF30',wt:'8.8 kg',h:'ok',ico:'🚗',pn:'BDY-RBMP-CF-M4',desc:'M4 rear bumper with integrated diffuser and quad exhaust cutouts.',svc:['Remove trunk liner','Disconnect PDC connectors','Pull bumper rearward'],mnt:{'PDC Sensor Check':'Annual'},spec:{PDC:'4 sensors',Exhaust:'4x cutouts'},tor:'10 Nm',rel:['taillight_left','taillight_right','rear_diffuser'],par:'Body Assembly',chi:['taillight_left','taillight_right']},
  front_fender_left:      {n:'Front Left Fender',cat:'body',asm:'Body',mat:'Steel/Aluminium',wt:'6.2 kg',h:'ok',ico:'🚗',pn:'BDY-FFL-M4-001',desc:'Front left wheel arch panel. Widened M-specific flare +35mm.',svc:['Remove wheel arch liner','Remove 8 bolts M6 8 Nm'],mnt:{'Stone-chip Inspection':'Annual'},spec:{Width:'+35 mm'},tor:'8 Nm',rel:['engine_hood','door_front_left'],par:'Body Assembly',chi:[]},
  front_fender_right:     {n:'Front Right Fender',cat:'body',asm:'Body',mat:'Steel/Aluminium',wt:'6.2 kg',h:'ok',ico:'🚗',pn:'BDY-FFR-M4-001',desc:'Mirror image of front left fender. M-widened arch +35mm.',svc:['Same procedure as front left fender'],mnt:{'Stone-chip Inspection':'Annual'},spec:{Width:'+35 mm'},tor:'8 Nm',rel:['engine_hood','door_front_right'],par:'Body Assembly',chi:[]},
  door_front_left:        {n:'Front Left Door',cat:'body',asm:'Body',mat:'UHSS/Aluminium Skin',wt:'48 kg',h:'ok',ico:'🚪',pn:'BDY-DFL-M4-001',desc:'Front left door with acoustic glass and side airbag.',svc:['Remove door card','Disconnect window regulator','Remove hinge bolts M10 50 Nm — 2 technicians'],mnt:{'Hinge Grease':'Every 2 years'},spec:{Weight:'48 kg',Airbag:'Side SRS'},tor:'50 Nm hinge bolts',rel:['door_front_right'],par:'Body Assembly',chi:[]},
  door_front_right:       {n:'Front Right Door',cat:'body',asm:'Body',mat:'UHSS/Aluminium Skin',wt:'48 kg',h:'ok',ico:'🚪',pn:'BDY-DFR-M4-001',desc:'Front right door with mirror control loom.',svc:['Same as front left door'],mnt:{'Hinge Grease':'Every 2 years'},spec:{Weight:'48 kg'},tor:'50 Nm',rel:['door_front_left'],par:'Body Assembly',chi:[]},
  door_rear_left:         {n:'Rear Left Door',cat:'body',asm:'Body',mat:'UHSS/Aluminium Skin',wt:'45 kg',h:'ok',ico:'🚪',pn:'BDY-DRL-M4-001',desc:'Rear left door with child safety lock.',svc:['Remove rear door card','Disconnect window regulator','Remove B-pillar weatherstrip'],mnt:{'Hinge Grease':'Every 2 years'},spec:{Weight:'45 kg',Child_lock:'Yes'},tor:'50 Nm',rel:['door_rear_right'],par:'Body Assembly',chi:[]},
  door_rear_right:        {n:'Rear Right Door',cat:'body',asm:'Body',mat:'UHSS/Aluminium Skin',wt:'45 kg',h:'ok',ico:'🚪',pn:'BDY-DRR-M4-001',desc:'Rear right door with acoustic glass.',svc:['Same as rear left door'],mnt:{'Hinge Grease':'Every 2 years'},spec:{Weight:'45 kg'},tor:'50 Nm',rel:['door_rear_left'],par:'Body Assembly',chi:[]},
  windshield_front:       {n:'Front Windscreen (Heated)',cat:'body',asm:'Glazing',mat:'Acoustic Laminated Glass',wt:'14.8 kg',h:'ok',ico:'🪟',pn:'GLS-WSF-M4-HUD',desc:'Heated acoustic windscreen with HUD zone and rain sensor.',svc:['Cut adhesive bond','Clean body flange','Apply Sika Tack Drive','Cure 4 hours'],mnt:{'Chip Repair':'At <10mm chip'},spec:{Heated:'Yes',HUD:'Yes',Thickness:'5.5 mm'},tor:'N/A (bonded)',rel:['windshield_rear','roof_panel'],par:'Body Assembly',chi:[]},
  windshield_rear:        {n:'Rear Windscreen',cat:'body',asm:'Glazing',mat:'Toughened Glass',wt:'8.4 kg',h:'ok',ico:'🪟',pn:'GLS-WSR-M4-001',desc:'Heated rear windscreen with antenna integration.',svc:['Cut adhesive bond','Apply Sika Tack Drive'],mnt:{'Replacement':'At crack'},spec:{Type:'Toughened',Heated:'Yes'},tor:'N/A (bonded)',rel:['windshield_front','roof_panel'],par:'Body Assembly',chi:[]},
  headlight_left:         {n:'Left Adaptive LED Headlight',cat:'body',asm:'Exterior Lighting',mat:'PC Lens/Al Housing',wt:'4.8 kg',h:'ok',ico:'💡',pn:'LGT-AHL-L-M4-LED',desc:'Full LED adaptive headlight. Camera-controlled cornering. Anti-dazzle matrix.',svc:['Remove front bumper','Disconnect 5-pin connector','Remove 3 bolts M8 8 Nm','Aim via BMW ISTA'],mnt:{'Aim Check':'Annual'},spec:{Type:'Full LED Matrix',Colour_temp:'5500 K'},tor:'8 Nm mounting bolts',rel:['headlight_right','drl_left'],par:'Front Bumper',chi:[]},
  headlight_right:        {n:'Right Adaptive LED Headlight',cat:'body',asm:'Exterior Lighting',mat:'PC Lens/Al Housing',wt:'4.8 kg',h:'ok',ico:'💡',pn:'LGT-AHL-R-M4-LED',desc:'Mirror image of left headlight.',svc:['Same as left headlight'],mnt:{'Aim Check':'Annual'},spec:{Type:'Full LED Matrix'},tor:'8 Nm',rel:['headlight_left','drl_right'],par:'Front Bumper',chi:[]},
  drl_left:               {n:'Left Daytime Running Light',cat:'body',asm:'Exterior Lighting',mat:'OLED/Polycarbonate',wt:'0.8 kg',h:'ok',ico:'💡',pn:'LGT-DRL-L-M4',desc:'L-shaped DRL strip. BMW M4 signature OLED.',svc:['Integrated into headlight','Replace headlight unit if DRL fails'],mnt:{'Inspection':'Annual'},spec:{Tech:'OLED',Signature:'L-shaped'},tor:'N/A',rel:['headlight_left','drl_right'],par:'Left Headlight',chi:[]},
  drl_right:              {n:'Right Daytime Running Light',cat:'body',asm:'Exterior Lighting',mat:'OLED/Polycarbonate',wt:'0.8 kg',h:'ok',ico:'💡',pn:'LGT-DRL-R-M4',desc:'Right DRL OLED strip.',svc:['Same as left DRL'],mnt:{'Inspection':'Annual'},spec:{Tech:'OLED'},tor:'N/A',rel:['headlight_right','drl_left'],par:'Right Headlight',chi:[]},
  taillight_left:         {n:'Left Taillight (OLED)',cat:'body',asm:'Exterior Lighting',mat:'OLED/ABS Housing',wt:'1.4 kg',h:'ok',ico:'🔴',pn:'LGT-TL-L-M4-OLED',desc:'BMW M4 OLED taillight. Welcome/goodbye animation.',svc:['Access 2 retaining nuts from trunk','Unplug 3-pin OLED connector'],mnt:{'Inspection':'Annual'},spec:{Tech:'OLED',IP:'IP67'},tor:'6 Nm mounting nuts',rel:['taillight_right'],par:'Rear Bumper',chi:[]},
  taillight_right:        {n:'Right Taillight (OLED)',cat:'body',asm:'Exterior Lighting',mat:'OLED/ABS Housing',wt:'1.4 kg',h:'ok',ico:'🔴',pn:'LGT-TL-R-M4-OLED',desc:'Same as left OLED taillight.',svc:['Same as left taillight'],mnt:{'Inspection':'Annual'},spec:{Tech:'OLED',IP:'IP67'},tor:'6 Nm',rel:['taillight_left'],par:'Rear Bumper',chi:[]},
  brake_light_center:     {n:'Centre High-Mount Brake Light',cat:'body',asm:'Exterior Lighting',mat:'LED/Polycarbonate',wt:'0.4 kg',h:'ok',ico:'🔴',pn:'LGT-HMBL-M4-001',desc:'Centre high-mount stop light integrated into trunk lid.',svc:['Remove trunk liner','Disconnect 2-pin LED connector'],mnt:{'Inspection':'Annual'},spec:{Tech:'LED'},tor:'Hand tight',rel:['taillight_left','taillight_right'],par:'Trunk Lid',chi:[]},
  tire_fl:                {n:'Front Left Tyre (Michelin)',cat:'chassis',asm:'Wheels & Tyres',mat:'Silica Rubber',wt:'12.8 kg',h:'ok',ico:'🛞',pn:'TYR-275-35-R20-FL',desc:'Michelin Pilot Sport 4S. 275/35 ZR20. Speed Y (300 km/h).',svc:['Loosen wheel bolts before jacking','Remove 5 bolts 120 Nm','Inflate to 2.7 bar cold'],mnt:{'Rotation':'Every 10,000 km','Pressure':'Monthly'},spec:{Size:'275/35 ZR20',Pressure:'2.7 bar'},tor:'120 Nm wheel bolts',rel:['rim_fl','brake_caliper_fl'],par:'Front Left Corner',chi:[]},
  tire_fr:                {n:'Front Right Tyre',cat:'chassis',asm:'Wheels & Tyres',mat:'Silica Rubber',wt:'12.8 kg',h:'ok',ico:'🛞',pn:'TYR-275-35-R20-FR',desc:'Michelin Pilot Sport 4S. 275/35 ZR20.',svc:['Same as Front Left Tyre'],mnt:{'Pressure':'Monthly'},spec:{Size:'275/35 ZR20',Pressure:'2.7 bar'},tor:'120 Nm',rel:['rim_fr','brake_caliper_fr'],par:'Front Right Corner',chi:[]},
  tire_rl:                {n:'Rear Left Tyre',cat:'chassis',asm:'Wheels & Tyres',mat:'Silica Rubber',wt:'13.4 kg',h:'ok',ico:'🛞',pn:'TYR-285-30-R20-RL',desc:'Michelin Pilot Sport 4S. 285/30 ZR20. Wider rear spec.',svc:['Same as front — wider 285/30 fitment','Inflate to 2.5 bar'],mnt:{'Pressure':'Monthly'},spec:{Size:'285/30 ZR20',Pressure:'2.5 bar'},tor:'120 Nm',rel:['rim_rl','brake_caliper_rl'],par:'Rear Left Corner',chi:[]},
  tire_rr:                {n:'Rear Right Tyre',cat:'chassis',asm:'Wheels & Tyres',mat:'Silica Rubber',wt:'13.4 kg',h:'ok',ico:'🛞',pn:'TYR-285-30-R20-RR',desc:'Michelin Pilot Sport 4S. 285/30 ZR20.',svc:['Same as rear left tyre'],mnt:{'Pressure':'Monthly'},spec:{Size:'285/30 ZR20',Pressure:'2.5 bar'},tor:'120 Nm',rel:['rim_rr','brake_caliper_rr'],par:'Rear Right Corner',chi:[]},
  rim_fl:                 {n:'Front Left Rim 20" Forged',cat:'chassis',asm:'Wheels & Tyres',mat:'Forged Aluminium',wt:'10.2 kg',h:'ok',ico:'⚙️',pn:'RIM-869M-20-FL',desc:'BMW M 20" forged double-spoke alloy. Style 869M Bicolour. 9J ET29.',svc:['Balance within 5g','Inspect for kerb damage'],mnt:{'Alignment':'Every 20,000 km'},spec:{Size:'20"',Width:'9J ET29',Finish:'Bicolour'},tor:'120 Nm',rel:['tire_fl','brake_disc_fl'],par:'Front Left Corner',chi:[]},
  rim_fr:                 {n:'Front Right Rim 20" Forged',cat:'chassis',asm:'Wheels & Tyres',mat:'Forged Aluminium',wt:'10.2 kg',h:'ok',ico:'⚙️',pn:'RIM-869M-20-FR',desc:'Same as front left rim. 9J ET29.',svc:['Balance before fitting'],mnt:{'Alignment':'Every 20,000 km'},spec:{Size:'20"',Width:'9J ET29'},tor:'120 Nm',rel:['tire_fr','brake_disc_fr'],par:'Front Right Corner',chi:[]},
  rim_rl:                 {n:'Rear Left Rim 20" Forged',cat:'chassis',asm:'Wheels & Tyres',mat:'Forged Aluminium',wt:'10.8 kg',h:'ok',ico:'⚙️',pn:'RIM-869M-20-RL',desc:'Wider 10.5J rear rim. ET19.',svc:['Do not mix with front rims'],mnt:{'Alignment':'Every 20,000 km'},spec:{Size:'20"',Width:'10.5J ET19'},tor:'120 Nm',rel:['tire_rl','brake_disc_rl'],par:'Rear Left Corner',chi:[]},
  rim_rr:                 {n:'Rear Right Rim 20" Forged',cat:'chassis',asm:'Wheels & Tyres',mat:'Forged Aluminium',wt:'10.8 kg',h:'ok',ico:'⚙️',pn:'RIM-869M-20-RR',desc:'Same as rear left rim. 10.5J ET19.',svc:['Same as rear left rim'],mnt:{'Alignment':'Every 20,000 km'},spec:{Width:'10.5J ET19'},tor:'120 Nm',rel:['tire_rr','brake_disc_rr'],par:'Rear Right Corner',chi:[]},
  brake_caliper_fl:       {n:'Front Left Brake Caliper',cat:'chassis',asm:'Brakes',mat:'Monobloc Aluminium',wt:'5.4 kg',h:'ok',ico:'🔴',pn:'BRK-6POT-FL-M4',desc:'M4 6-piston fixed caliper. 400mm disc. Frozen Blue or Red.',svc:['Bleed with DOT4 LV','Compress 6 pistons with spreader','Torque bolts 130 Nm'],mnt:{'Brake Fluid':'Every 2 years','Pads':'At <3 mm'},spec:{Type:'6-piston',Disc:'400 mm'},tor:'130 Nm',rel:['brake_disc_fl','abs_control_module'],par:'Front Left Corner',chi:[]},
  brake_caliper_fr:       {n:'Front Right Brake Caliper',cat:'chassis',asm:'Brakes',mat:'Monobloc Aluminium',wt:'5.4 kg',h:'ok',ico:'🔴',pn:'BRK-6POT-FR-M4',desc:'Mirror image of FL 6-piston caliper.',svc:['Same as front left'],mnt:{'Pads':'At <3 mm'},spec:{Type:'6-piston',Disc:'400 mm'},tor:'130 Nm',rel:['brake_disc_fr'],par:'Front Right Corner',chi:[]},
  brake_caliper_rl:       {n:'Rear Left Brake Caliper',cat:'chassis',asm:'Brakes',mat:'Monobloc Aluminium',wt:'4.1 kg',h:'ok',ico:'🔴',pn:'BRK-4POT-RL-M4',desc:'M4 4-piston rear caliper. 380mm disc. Electric parking brake.',svc:['Use wind-back tool — DO NOT push pistons straight in','Activate parking brake after fitting'],mnt:{'Pads':'At <3 mm'},spec:{Type:'4-piston',Disc:'380 mm'},tor:'110 Nm',rel:['brake_disc_rl'],par:'Rear Left Corner',chi:[]},
  brake_caliper_rr:       {n:'Rear Right Brake Caliper',cat:'chassis',asm:'Brakes',mat:'Monobloc Aluminium',wt:'4.1 kg',h:'ok',ico:'🔴',pn:'BRK-4POT-RR-M4',desc:'Mirror image of rear left caliper.',svc:['Same as rear left'],mnt:{'Pads':'At <3 mm'},spec:{Type:'4-piston',Disc:'380 mm'},tor:'110 Nm',rel:['brake_disc_rr'],par:'Rear Right Corner',chi:[]},
  brake_disc_fl:          {n:'Front Left Brake Disc',cat:'chassis',asm:'Brakes',mat:'Composite Iron',wt:'14.8 kg',h:'ok',ico:'💿',pn:'BRK-DSC-400-FL',desc:'400mm ventilated and slotted disc. Replace in axle pairs.',svc:['Measure at 5 points min 36mm','Check runout max 0.08mm','Bed-in with 8 stops from 80 km/h'],mnt:{'Inspect':'Every pad change','Replace':'Below 36 mm'},spec:{Diameter:'400 mm',Min:'36 mm',Type:'Vented+slotted'},tor:'10 Nm',rel:['brake_caliper_fl'],par:'Front Left Corner',chi:[]},
  brake_disc_fr:          {n:'Front Right Brake Disc',cat:'chassis',asm:'Brakes',mat:'Composite Iron',wt:'14.8 kg',h:'ok',ico:'💿',pn:'BRK-DSC-400-FR',desc:'400mm ventilated slotted disc.',svc:['Replace in axle pairs with FL'],mnt:{'Replace':'Below 36 mm'},spec:{Diameter:'400 mm'},tor:'10 Nm',rel:['brake_caliper_fr'],par:'Front Right Corner',chi:[]},
  brake_disc_rl:          {n:'Rear Left Brake Disc',cat:'chassis',asm:'Brakes',mat:'Composite Iron',wt:'12.2 kg',h:'ok',ico:'💿',pn:'BRK-DSC-380-RL',desc:'380mm ventilated rear disc with parking drum.',svc:['Measure disc min 32mm'],mnt:{'Replace':'Below 32 mm'},spec:{Diameter:'380 mm',Min:'32 mm'},tor:'10 Nm',rel:['brake_caliper_rl'],par:'Rear Left Corner',chi:[]},
  brake_disc_rr:          {n:'Rear Right Brake Disc',cat:'chassis',asm:'Brakes',mat:'Composite Iron',wt:'12.2 kg',h:'ok',ico:'💿',pn:'BRK-DSC-380-RR',desc:'380mm rear disc. Axle pair with RL.',svc:['Replace in axle pairs'],mnt:{'Replace':'Below 32 mm'},spec:{Diameter:'380 mm'},tor:'10 Nm',rel:['brake_caliper_rr'],par:'Rear Right Corner',chi:[]},
  abs_control_module:     {n:'ABS / DSC Control Module',cat:'chassis',asm:'Safety Systems',mat:'Die-cast Aluminium',wt:'1.8 kg',h:'ok',ico:'🛡️',pn:'ABS-ICM4-DSC-M4',desc:'BMW ICM4. Controls ABS, DSC, EDC, xDrive, M modes.',svc:['Bleed ABS module after removal','Requires coding after replacement'],mnt:{'Software Update':'Per TSB'},spec:{Protocols:'CAN/FlexRay',Response:'<10 ms'},tor:'22 Nm',rel:['brake_master_cylinder','ecu_main'],par:'Safety Systems',chi:[]},
  brake_master_cylinder:  {n:'Brake Master Cylinder',cat:'chassis',asm:'Brakes',mat:'Aluminium/Steel',wt:'2.4 kg',h:'ok',ico:'🔧',pn:'BRK-BMC-M4-001',desc:'Tandem brake master cylinder. 26mm primary piston.',svc:['Disconnect brake lines','Remove 2 nuts M10 25 Nm','Bench-bleed before fitting'],mnt:{'Brake Fluid':'Every 2 years'},spec:{Piston_dia:'26 mm',Fluid:'DOT4 LV'},tor:'25 Nm',rel:['abs_control_module'],par:'Brakes',chi:[]},
  wishbone_upper_fl:      {n:'Upper Wishbone — Front Left',cat:'suspension',asm:'Suspension',mat:'Forged Aluminium 7075',wt:'2.1 kg',h:'ok',ico:'🔩',pn:'SUS-UWB-FL-7075',desc:'Double-joint front upper control arm. Pillow-ball mount.',svc:['Mark cam bolt position','Remove inner bush bolts M10 65 Nm','Set 4-wheel alignment after'],mnt:{'Bush Inspection':'Every 40,000 km'},spec:{Material:'Forged Al 7075',Adjustable:'±1.5°'},tor:'65 Nm',rel:['shock_absorber_fl'],par:'Front Suspension',chi:[]},
  wishbone_upper_fr:      {n:'Upper Wishbone — Front Right',cat:'suspension',asm:'Suspension',mat:'Forged Aluminium 7075',wt:'2.1 kg',h:'ok',ico:'🔩',pn:'SUS-UWB-FR-7075',desc:'Same as front left upper wishbone.',svc:['Same as FL'],mnt:{'Bush Inspection':'Every 40,000 km'},spec:{Material:'Forged Al 7075'},tor:'65 Nm',rel:['shock_absorber_fr'],par:'Front Suspension',chi:[]},
  wishbone_upper_rl:      {n:'Upper Wishbone — Rear Left',cat:'suspension',asm:'Suspension',mat:'Forged Aluminium 7075',wt:'2.3 kg',h:'ok',ico:'🔩',pn:'SUS-UWB-RL-7075',desc:'Rear upper control arm. Integral-link axle.',svc:['Torque at neutral load','4-wheel alignment required after'],mnt:{'Bush Check':'Every 40,000 km'},spec:{Material:'Forged Al 7075'},tor:'65 Nm (loaded)',rel:['shock_absorber_rl'],par:'Rear Suspension',chi:[]},
  wishbone_upper_rr:      {n:'Upper Wishbone — Rear Right',cat:'suspension',asm:'Suspension',mat:'Forged Aluminium 7075',wt:'2.3 kg',h:'ok',ico:'🔩',pn:'SUS-UWB-RR-7075',desc:'Same as rear left upper wishbone.',svc:['Same as RL'],mnt:{'Bush Check':'Every 40,000 km'},spec:{Material:'Forged Al 7075'},tor:'65 Nm',rel:['shock_absorber_rr'],par:'Rear Suspension',chi:[]},
  shock_absorber_fl:      {n:'Front Left Adaptive Damper',cat:'suspension',asm:'Suspension',mat:'Aluminium/Chrome Rod',wt:'4.2 kg',h:'ok',ico:'🔧',pn:'DMR-EDC-FL-M4',desc:'M Adaptive EDC damper. Comfort/Sport/Sport+ modes.',svc:['USE SPRING COMPRESSOR — LETHAL if released unsafely','Remove top mount nuts M10 18 Nm','Remove lower clamp bolts M14 120 Nm'],mnt:{'Oil Seal':'Every 40,000 km','Replace':'At 80-100,000 km'},spec:{Type:'Twin-tube EDC',Travel:'150 mm',Modes:'Comfort/Sport/Sport+'},tor:'Top: 18 Nm | Lower: 120 Nm',rel:['coil_spring_fl','wishbone_upper_fl'],par:'Front Suspension',chi:['coil_spring_fl']},
  shock_absorber_fr:      {n:'Front Right Adaptive Damper',cat:'suspension',asm:'Suspension',mat:'Aluminium/Chrome Rod',wt:'4.2 kg',h:'ok',ico:'🔧',pn:'DMR-EDC-FR-M4',desc:'Same as front left EDC damper.',svc:['Same as FL — spring compressor mandatory'],mnt:{'Replace':'At 100,000 km'},spec:{Type:'Twin-tube EDC'},tor:'Top: 18 Nm | Lower: 120 Nm',rel:['coil_spring_fr'],par:'Front Suspension',chi:['coil_spring_fr']},
  shock_absorber_rl:      {n:'Rear Left Adaptive Damper',cat:'suspension',asm:'Suspension',mat:'Aluminium/Chrome Rod',wt:'4.5 kg',h:'ok',ico:'🔧',pn:'DMR-EDC-RL-M4',desc:'M Adaptive rear damper. Integral-link rear axle.',svc:['Lower subframe or use spacer blocks','Compress spring before removal'],mnt:{'Replace':'At 100,000 km'},spec:{Type:'Twin-tube EDC',Travel:'130 mm'},tor:'140 Nm lower',rel:['coil_spring_rl'],par:'Rear Suspension',chi:['coil_spring_rl']},
  shock_absorber_rr:      {n:'Rear Right Adaptive Damper',cat:'suspension',asm:'Suspension',mat:'Aluminium/Chrome Rod',wt:'4.5 kg',h:'ok',ico:'🔧',pn:'DMR-EDC-RR-M4',desc:'Same as rear left adaptive damper.',svc:['Same as RL'],mnt:{'Replace':'At 100,000 km'},spec:{Type:'Twin-tube EDC'},tor:'140 Nm',rel:['coil_spring_rr'],par:'Rear Suspension',chi:['coil_spring_rr']},
  coil_spring_fl:         {n:'Front Left Coil Spring',cat:'suspension',asm:'Suspension',mat:'Cr-Si Spring Steel',wt:'3.2 kg',h:'ok',ico:'🌀',pn:'SUS-CSP-FL-M4',desc:'Progressive-rate spring. 42 N/mm initial / 68 N/mm loaded.',svc:['MUST use spring compressor — LETHAL if released'],mnt:{'Inspect':'Every 80,000 km'},spec:{Rate:'42-68 N/mm progressive',Height:'M sport -10mm'},tor:'18 Nm strut top',rel:['shock_absorber_fl'],par:'Front Suspension',chi:[]},
  coil_spring_fr:         {n:'Front Right Coil Spring',cat:'suspension',asm:'Suspension',mat:'Cr-Si Spring Steel',wt:'3.2 kg',h:'ok',ico:'🌀',pn:'SUS-CSP-FR-M4',desc:'Same as front left coil spring.',svc:['MUST use spring compressor'],mnt:{'Inspect':'Every 80,000 km'},spec:{Rate:'42-68 N/mm'},tor:'18 Nm',rel:['shock_absorber_fr'],par:'Front Suspension',chi:[]},
  coil_spring_rl:         {n:'Rear Left Coil Spring',cat:'suspension',asm:'Suspension',mat:'Cr-Si Spring Steel',wt:'3.4 kg',h:'ok',ico:'🌀',pn:'SUS-CSP-RL-M4',desc:'Rear progressive spring. 38-62 N/mm.',svc:['Spring compressor mandatory'],mnt:{'Inspect':'Every 80,000 km'},spec:{Rate:'38-62 N/mm'},tor:'140 Nm lower',rel:['shock_absorber_rl'],par:'Rear Suspension',chi:[]},
  coil_spring_rr:         {n:'Rear Right Coil Spring',cat:'suspension',asm:'Suspension',mat:'Cr-Si Spring Steel',wt:'3.4 kg',h:'ok',ico:'🌀',pn:'SUS-CSP-RR-M4',desc:'Same as rear left coil spring.',svc:['Spring compressor mandatory'],mnt:{'Inspect':'Every 80,000 km'},spec:{Rate:'38-62 N/mm'},tor:'140 Nm',rel:['shock_absorber_rr'],par:'Rear Suspension',chi:[]},
  anti_roll_bar_front:    {n:'Front Anti-Roll Bar',cat:'suspension',asm:'Suspension',mat:'Forged Steel 42CrMo4',wt:'3.8 kg',h:'ok',ico:'🔩',pn:'SUS-ARB-F25-M4',desc:'25mm active electro-hydraulic anti-roll bar. Reduces body roll 35%.',svc:['Disconnect drop links M10 55 Nm','Remove bush clamp bolts M8 28 Nm'],mnt:{'Bush Inspection':'Every 40,000 km'},spec:{Diameter:'25 mm',Type:'Active EHC'},tor:'28 Nm clamps | 55 Nm links',rel:['anti_roll_bar_rear'],par:'Front Suspension',chi:[]},
  anti_roll_bar_rear:     {n:'Rear Anti-Roll Bar',cat:'suspension',asm:'Suspension',mat:'Forged Steel',wt:'3.2 kg',h:'ok',ico:'🔩',pn:'SUS-ARB-R21-M4',desc:'21mm rear anti-roll bar.',svc:['Disconnect drop links 55 Nm','Remove bush clamps 28 Nm'],mnt:{'Bush Inspection':'Every 40,000 km'},spec:{Diameter:'21 mm'},tor:'28 Nm | 55 Nm',rel:['anti_roll_bar_front'],par:'Rear Suspension',chi:[]},
  engine_block:           {n:'Engine Block B58 Inline-6',cat:'powertrain',asm:'Powertrain',mat:'Cast Aluminium A380',wt:'218 kg',h:'ok',ico:'🔥',pn:'ENG-B58B30M1-001',desc:'BMW B58B30 Inline-6 3.0L TwinPower. 530 HP at 6250 RPM. Closed deck.',svc:['Depressurise fuel and disconnect battery','Drain oil 6.5L and coolant 12L','Remove all wiring and hoses','Support with hoist 350 kg min','Replace all gaskets'],mnt:{'Oil Change':'Every 10,000 km','Coolant Flush':'Every 3 years','Timing Chain':'Every 150,000 km'},spec:{Displacement:'2998 cc',Compression:'10.2:1',Bore:'82 mm',Stroke:'94.6 mm',Power:'530 HP'},tor:'Mount bolts: 85 Nm',rel:['cylinder_head','turbocharger','engine_oil_pan'],par:'Powertrain Assembly',chi:['cylinder_head','engine_oil_pan']},
  cylinder_head:          {n:'Cylinder Head DOHC 24v',cat:'powertrain',asm:'Powertrain',mat:'Cast Aluminium',wt:'34 kg',h:'ok',ico:'⚙️',pn:'B58B30-HEAD-001',desc:'DOHC 24-valve head with Valvetronic 0-9.9mm lift.',svc:['Cool engine 2 hours','Remove valve cover 10x M6 10 Nm','Torque in 3 stages: 30+60+90 degrees'],mnt:{'Valve Cover Gasket':'Every 80,000 km'},spec:{Valves:'24',Valve_lift:'0-9.9 mm',Camshaft:'Dual overhead'},tor:'Head bolts: 30+60+90 deg',rel:['engine_block','turbocharger'],par:'Engine Block',chi:[]},
  turbocharger:           {n:'Twin-Scroll Turbocharger',cat:'powertrain',asm:'Powertrain',mat:'Inconel Turbine',wt:'12.4 kg',h:'ok',ico:'🌀',pn:'TRB-B58-TS350',desc:'BMW TwinPower twin-scroll turbo. Max boost 1.3 bar. 200,000 RPM.',svc:['Cool turbo 30 min before removal','Disconnect oil feed and return lines','Remove exhaust flange 4x M8 25 Nm','Prime with oil before startup'],mnt:{'Oil Change':'Every 10,000 km','Replace':'Every 200,000 km'},spec:{Type:'Twin-scroll',Max_boost:'1.3 bar',Turbine_speed:'200,000 RPM'},tor:'Exhaust flange: 25 Nm',rel:['engine_block','intercooler'],par:'Engine Assembly',chi:['intercooler']},
  intercooler:            {n:'Front-Mount Intercooler',cat:'powertrain',asm:'Powertrain',mat:'Aluminium Bar-and-Plate',wt:'8.2 kg',h:'ok',ico:'❄️',pn:'ICL-FMIC-B58-001',desc:'FMIC. Core 600x250x55mm. Efficiency >85%.',svc:['Remove front bumper','Disconnect charge pipe boots','Drain residual oil'],mnt:{'Core Cleaning':'Every 80,000 km'},spec:{Core:'600x250x55 mm',Efficiency:'>85%'},tor:'Charge pipe clamps: 5 Nm',rel:['turbocharger','radiator'],par:'Forced Induction',chi:[]},
  radiator:               {n:'Engine Cooling Radiator',cat:'powertrain',asm:'Cooling System',mat:'Aluminium Core/Plastic',wt:'6.8 kg',h:'ok',ico:'🌡️',pn:'RAD-M4-ALU-001',desc:'Cross-flow aluminium radiator. Capacity 180 kW. Integrated ATF cooler.',svc:['Drain coolant via lower drain 12L','Remove hoses and ATF cooler lines'],mnt:{'Coolant Flush':'Every 3 years'},spec:{Capacity:'180 kW',Volume:'12.0 L'},tor:'Drain plug: 1.5 Nm',rel:['coolant_reservoir','intercooler'],par:'Cooling System',chi:[]},
  gearbox_8spd:           {n:'8-Speed ZF 8HP76 Gearbox',cat:'powertrain',asm:'Drivetrain',mat:'Aluminium/Steel Internal',wt:'92 kg',h:'ok',ico:'⚙️',pn:'ZF-8HP76-M4-001',desc:'ZF 8HP76. Max torque 750 Nm. M paddle shift. Launch Control.',svc:['Drain ATF 8.5L ZF Lifeguard 8','Remove propshaft couplings M8 22 Nm','Support with transmission jack'],mnt:{'ATF Change':'Every 60,000 km'},spec:{Torque_capacity:'750 Nm',Ratios:'4.71/3.14/2.11/1.67/1.29/1.00/0.84/0.67'},tor:'Mount bolts: 80 Nm',rel:['engine_block','driveshaft_rear','transfer_case'],par:'Drivetrain',chi:[]},
  transfer_case:          {n:'xDrive Transfer Case',cat:'powertrain',asm:'Drivetrain',mat:'Aluminium Alloy',wt:'28 kg',h:'ok',ico:'🔄',pn:'ATC-450-M4-AWD',desc:'BMW xDrive ATC-450. Electronic torque split 0-100% rear.',svc:['Drain transfer case SAF-XO','Disconnect front and rear propshaft flanges 22 Nm'],mnt:{'Oil Change':'Every 60,000 km'},spec:{Type:'Electro-hydraulic',Response:'<150 ms'},tor:'Flange bolts: 22 Nm',rel:['gearbox_8spd','driveshaft_rear'],par:'Drivetrain',chi:[]},
  driveshaft_rear:        {n:'Rear Propshaft (Carbon)',cat:'powertrain',asm:'Drivetrain',mat:'Carbon Fibre/Steel Flanges',wt:'5.6 kg',h:'ok',ico:'🔧',pn:'DRV-PSF-REAR-CF',desc:'One-piece carbon fibre propshaft. 40% lighter than steel. 750 Nm.',svc:['Mark flange orientation before removal','Remove 6x M8 flange bolts 22 Nm each end','Balance dynamically after reinstallation'],mnt:{'Flange Check':'Every 60,000 km'},spec:{Material:'Carbon fibre',Torque:'750 Nm',Balance:'6000 RPM'},tor:'Flange bolts: 22 Nm',rel:['gearbox_8spd','transfer_case'],par:'Drivetrain',chi:[]},
  fuel_tank:              {n:'Fuel Tank Assembly 60L',cat:'powertrain',asm:'Fuel System',mat:'HDPE Blow-moulded',wt:'18.5 kg',h:'ok',ico:'⛽',pn:'FUEL-TNK-60L-M4',desc:'60L HDPE fuel tank with integrated surge pot and HPFP.',svc:['Depressurise fuel system 10+ bar residual','Disconnect battery negative','Drain tank completely','Remove 6 strap bolts M10 40 Nm'],mnt:{'Inspection':'Every 80,000 km'},spec:{Capacity:'60 L',Pump:'In-tank HPFP'},tor:'40 Nm strap bolts',rel:['fuel_pump'],par:'Fuel System',chi:['fuel_pump']},
  fuel_pump:              {n:'High-Pressure Fuel Pump',cat:'powertrain',asm:'Fuel System',mat:'Steel/Teflon Seals',wt:'1.2 kg',h:'ok',ico:'⛽',pn:'FUEL-HPFP-B58-001',desc:'Piezo-controlled HPFP. 350 bar direct injection. Cam-driven.',svc:['Depressurise fuel rail','Remove cam bolt M8 22 Nm','Replace all seals'],mnt:{'Replace':'Every 150,000 km'},spec:{Pressure:'350 bar',Type:'Piezo HPFP'},tor:'22 Nm cam bolt',rel:['fuel_tank','engine_block'],par:'Fuel System',chi:[]},
  engine_oil_pan:         {n:'Engine Oil Sump / Pan',cat:'powertrain',asm:'Powertrain',mat:'Cast Aluminium',wt:'4.2 kg',h:'ok',ico:'🛢️',pn:'ENG-PAN-B58-001',desc:'Dry-sump lower oil pan. 6.5L capacity.',svc:['Drain hot oil 6.5L','Remove 16x M6 8 Nm','Apply Loctite 573','Wait 30 min before refill'],mnt:{'Oil Change':'Every 10,000 km'},spec:{Capacity:'6.5 L with filter',Oil_spec:'BMW LL-04 5W-30'},tor:'8 Nm',rel:['engine_block'],par:'Engine Assembly',chi:[]},
  exhaust_manifold:       {n:'Exhaust Manifold / Header',cat:'powertrain',asm:'Powertrain',mat:'Stainless Steel 304',wt:'7.8 kg',h:'ok',ico:'💨',pn:'EXH-MNF-B58-001',desc:'SS304 exhaust manifold with integrated EGR port.',svc:['Spray penetrating oil on studs 24h before','Remove heat shield','Remove manifold nuts 12x M8 45 Nm'],mnt:{'Gasket':'Every 80,000 km'},spec:{Material:'SS 304',Studs:'12x M8'},tor:'45 Nm',rel:['engine_block','turbocharger','catalytic_converter'],par:'Engine Assembly',chi:['catalytic_converter']},
  catalytic_converter:    {n:'Catalytic Converter',cat:'powertrain',asm:'Exhaust System',mat:'Cordierite Ceramic/PGM',wt:'4.8 kg',h:'ok',ico:'♻️',pn:'EXH-CAT-M4-001',desc:'Three-way cat. 400 CPSI substrate. EU7 emissions.',svc:['Allow 30 min cool-down','Remove lambda sensor 42 Nm','Remove 2 flange bolts 35 Nm'],mnt:{'Lambda Sensor':'Every 80,000 km'},spec:{Standard:'EU7',CPSI:'400'},tor:'35 Nm flanges',rel:['exhaust_manifold'],par:'Exhaust System',chi:[]},
  exhaust_pipe_left:      {n:'Exhaust Pipe Left',cat:'powertrain',asm:'Exhaust System',mat:'Stainless Steel 316L',wt:'4.2 kg',h:'ok',ico:'💨',pn:'EXH-PPL-M4-001',desc:'Left bank exhaust pipe. Centre section with titanium coating.',svc:['Cool exhaust fully','Spray penetrating oil on clamps','Remove 4 clamp bolts 45 Nm'],mnt:{'Inspection':'Every 40,000 km'},spec:{Material:'SS316L',Diameter:'76 mm OD'},tor:'45 Nm',rel:['exhaust_tip_left','catalytic_converter'],par:'Exhaust System',chi:['exhaust_tip_left']},
  exhaust_pipe_right:     {n:'Exhaust Pipe Right',cat:'powertrain',asm:'Exhaust System',mat:'Stainless Steel 316L',wt:'4.2 kg',h:'ok',ico:'💨',pn:'EXH-PPR-M4-001',desc:'Right bank exhaust pipe.',svc:['Same as left exhaust pipe'],mnt:{'Inspection':'Every 40,000 km'},spec:{Material:'SS316L',Diameter:'76 mm OD'},tor:'45 Nm',rel:['exhaust_tip_right','catalytic_converter'],par:'Exhaust System',chi:['exhaust_tip_right']},
  exhaust_tip_left:       {n:'Exhaust Tip Left (Titanium)',cat:'powertrain',asm:'Exhaust System',mat:'Titanium Grade 5',wt:'0.8 kg',h:'ok',ico:'💨',pn:'EXH-TIP-L-TI-M4',desc:'120mm titanium exhaust tip. Brushed finish.',svc:['Unscrew clamp and slide off'],mnt:{'Polish':'As required'},spec:{Material:'Titanium Gr5',Diameter:'120 mm'},tor:'6 Nm',rel:['exhaust_pipe_left','rear_diffuser'],par:'Exhaust Pipe Left',chi:[]},
  exhaust_tip_right:      {n:'Exhaust Tip Right (Titanium)',cat:'powertrain',asm:'Exhaust System',mat:'Titanium Grade 5',wt:'0.8 kg',h:'ok',ico:'💨',pn:'EXH-TIP-R-TI-M4',desc:'Right titanium exhaust tip.',svc:['Same as left'],mnt:{'Polish':'As required'},spec:{Material:'Titanium Gr5',Diameter:'120 mm'},tor:'6 Nm',rel:['exhaust_pipe_right'],par:'Exhaust System',chi:[]},
  battery_12v:            {n:'12V AGM Battery 90Ah',cat:'electrical',asm:'Electrical',mat:'ABS/Lead-AGM',wt:'22.5 kg',h:'warning',ico:'🔋',pn:'BAT-AGM-90AH-M4',desc:'12V 90Ah 850 CCA AGM battery. Trunk-mounted.',svc:['Disconnect negative FIRST','Remove hold-down bracket','Register new battery (BMW ISTA)','Reconnect positive then negative'],mnt:{'State Check':'Every 12 months','Replace':'Every 4-5 years'},spec:{Voltage:'12V',Capacity:'90Ah',CCA:'850A',Tech:'AGM'},tor:'6 Nm terminal clamps',rel:['alternator','ecu_main'],par:'Electrical System',chi:[]},
  alternator:             {n:'Alternator / Generator 180A',cat:'electrical',asm:'Electrical',mat:'Aluminium Housing',wt:'7.2 kg',h:'ok',ico:'⚡',pn:'ALT-180A-B58-VAL',desc:'Valeo 180A intelligent alternator. 14.4V regulation.',svc:['Disconnect battery negative','Remove serpentine belt','Remove 3 bolts 35 Nm'],mnt:{'Belt Check':'Every 40,000 km'},spec:{Output:'180A',Voltage:'14.4V'},tor:'35 Nm',rel:['battery_12v','engine_block'],par:'Electrical System',chi:[]},
  ecu_main:               {n:'Engine Control Unit DME',cat:'electrical',asm:'Electrical',mat:'Die-cast Aluminium',wt:'0.85 kg',h:'ok',ico:'🖥️',pn:'DME-B58-MSD87',desc:'Bosch MSD87 Digital Motor Electronics. Controls fuel, ignition, VVT, OBD-II.',svc:['Record existing coding before removal','Disconnect all connectors','Full programming required after replacement (BMW ISTA)'],mnt:{'Software Update':'Per TSB'},spec:{Processor:'32-bit',Memory:'4 MB flash',Protocols:'OBD-II/CAN/LIN'},tor:'5 Nm',rel:['battery_12v','abs_control_module'],par:'Electrical System',chi:[]},
  fuse_box:               {n:'Fuse Box / Junction Box',cat:'electrical',asm:'Electrical',mat:'ABS Polycarbonate',wt:'1.2 kg',h:'ok',ico:'⚡',pn:'ELC-FBX-M4-001',desc:'Engine bay fuse/relay box. 42 fuses, 18 relays.',svc:['Disconnect battery before replacement','Use approved fuse ratings only'],mnt:{'Inspection':'Every 40,000 km'},spec:{Fuses:'42',Relays:'18',Rating:'Max 80A'},tor:'N/A',rel:['battery_12v','ecu_main'],par:'Electrical System',chi:[]},
  dashboard_assembly:     {n:'Dashboard / Instrument Panel',cat:'interior',asm:'Interior',mat:'PP/ABS/Alcantara/Carbon',wt:'22.4 kg',h:'ok',ico:'🎛️',pn:'INT-DASH-M4-001',desc:'M4 Competition dashboard. Alcantara upper roll, carbon trim, passenger airbag.',svc:['Remove A-pillar trims','Disconnect HVAC and airbag looms','Remove 8 bolts M8 22 Nm','Extract as single unit with 2 technicians'],mnt:{'Vent Cleaning':'Every 2 years'},spec:{Screen:'12.3" Curved',Airbag:'Passenger SRS'},tor:'22 Nm',rel:['steering_wheel','center_console'],par:'Interior Assembly',chi:['infotainment_screen','steering_wheel']},
  steering_wheel:         {n:'M Sport Steering Wheel',cat:'interior',asm:'Interior',mat:'Alcantara/Carbon Fibre',wt:'3.8 kg',h:'ok',ico:'🎯',pn:'INT-STW-M4-ALT',desc:'M4 Alcantara/carbon wheel. M1/M2 buttons, shift paddles, integrated airbag.',svc:['Disable SRS — battery off wait 10 min','Use 5/16" square socket for clock spring','Loosen central nut M24 60 Nm'],mnt:{'Airbag Check':'Per SRS schedule'},spec:{Diameter:'370 mm',Material:'Alcantara+CF',Airbag:'2-stage SRS'},tor:'60 Nm centre nut',rel:['dashboard_assembly'],par:'Dashboard Assembly',chi:[]},
  seat_front_left:        {n:'M Driver Seat',cat:'interior',asm:'Interior',mat:'Merino Leather/CFRP Base',wt:'32.5 kg',h:'ok',ico:'💺',pn:'INT-ST-DRV-M4',desc:'M Sport carbon seat. Heating, cooling, memory, side bolsters.',svc:['Slide seat fully rearward','Remove 4 rail bolts M10 45 Nm','Disconnect 10 connectors','Follow SRS protocol — seat has side airbag'],mnt:{'Leather Conditioning':'Every 6 months'},spec:{Functions:'Heat/Cool/Memory',Airbag:'Side SRS'},tor:'45 Nm rail bolts',rel:['seat_front_right','center_console'],par:'Interior Assembly',chi:[]},
  seat_front_right:       {n:'M Passenger Seat',cat:'interior',asm:'Interior',mat:'Merino Leather',wt:'31.8 kg',h:'ok',ico:'💺',pn:'INT-ST-PAS-M4',desc:'Passenger seat with heat, ventilation, side airbag.',svc:['Same as driver seat — SRS precautions apply'],mnt:{'Leather Conditioning':'Every 6 months'},spec:{Airbag:'Side SRS'},tor:'45 Nm',rel:['seat_front_left'],par:'Interior Assembly',chi:[]},
  center_console:         {n:'Centre Console (CFRP)',cat:'interior',asm:'Interior',mat:'Carbon Fibre/Alcantara',wt:'6.5 kg',h:'ok',ico:'🕹️',pn:'INT-CC-M4-CF',desc:'M4 carbon console. M Drive selector, heated armrest, wireless charger.',svc:['Lift armrest and remove 2 hidden T30 bolts','Remove gear selector trim','Slide console rearward'],mnt:{'Wireless Charger':'Annual'},spec:{Wireless_charge:'Qi 10W',Heated_armrest:'Yes'},tor:'8 Nm',rel:['dashboard_assembly'],par:'Interior Assembly',chi:[]},
  infotainment_screen:    {n:'iDrive 8 Screen 12.3"',cat:'interior',asm:'Interior',mat:'Gorilla Glass/OLED',wt:'1.8 kg',h:'ok',ico:'📱',pn:'INT-IDR8-12-M4',desc:'BMW iDrive 8 curved 12.3" OLED. BMW OS 8. Wireless CarPlay. 5G.',svc:['Disconnect battery','Remove trim surround 4x T10','Disconnect LVDS cable','Requires software pairing (BMW ISTA)'],mnt:{'Software':'OTA as needed'},spec:{Size:'12.3" OLED',Resolution:'1920x720',Connectivity:'5G/WiFi6/BT5.2'},tor:'3 Nm',rel:['dashboard_assembly'],par:'Dashboard Assembly',chi:[]},
  front_splitter:         {n:'Front Carbon Splitter',cat:'body',asm:'Aerodynamics',mat:'CFRP 3K',wt:'1.8 kg',h:'ok',ico:'✈️',pn:'AERO-SPLT-F-CF',desc:'CFRP front splitter. -35 kg front downforce at 250 km/h.',svc:['Remove front undertray','Remove 6x M6 bolts'],mnt:{'Impact Inspection':'Every 10,000 km'},spec:{Downforce:'-35 kg @ 250 km/h'},tor:'8 Nm',rel:['rear_diffuser','roof_spoiler'],par:'Aerodynamics',chi:[]},
  rear_diffuser:          {n:'Rear Carbon Diffuser',cat:'body',asm:'Aerodynamics',mat:'CFRP 3K',wt:'2.2 kg',h:'ok',ico:'✈️',pn:'AERO-DFF-R-CF',desc:'CFRP rear diffuser. +45 kg rear downforce at 250 km/h.',svc:['Remove rear undertray first','Remove 8x M6 clips and 2x M8 bolts'],mnt:{'Inspection':'Every 20,000 km'},spec:{Downforce:'+45 kg @ 250 km/h'},tor:'8 Nm',rel:['front_splitter','exhaust_tip_left'],par:'Aerodynamics',chi:[]},
  roof_spoiler:           {n:'Roof Edge Spoiler (CFRP)',cat:'body',asm:'Aerodynamics',mat:'Carbon Fibre',wt:'0.9 kg',h:'ok',ico:'✈️',pn:'AERO-SPLT-ROOF-CF',desc:'Roof trailing edge spoiler. -15 kg rear lift.',svc:['Remove trunk lid inner trim','Remove 4x M6 bolts from inside'],mnt:{'Bond Inspection':'Annual'},spec:{Rear_lift_reduction:'15 kg'},tor:'6 Nm',rel:['rear_diffuser'],par:'Aerodynamics',chi:[]},
  power_steering_pump:    {n:'Electric Power Steering',cat:'chassis',asm:'Steering',mat:'Aluminium Housing',wt:'3.2 kg',h:'ok',ico:'🎯',pn:'STR-EPS-M4-001',desc:'BMW EPS variable ratio rack. Speed-sensitive assist.',svc:['Disconnect battery','Remove 3 bolts M10 45 Nm','Requires EPS calibration'],mnt:{'Inspection':'Every 60,000 km'},spec:{Type:'Electric',Ratio:'Variable 13:1-21:1'},tor:'45 Nm',rel:['steering_wheel'],par:'Steering System',chi:[]},
  front_grille:           {n:'Front Kidney Grille',cat:'body',asm:'Body',mat:'Gloss Black ABS',wt:'1.6 kg',h:'ok',ico:'🚗',pn:'BDY-KDY-M4-LRG',desc:'Enlarged M4 kidney grille with vertical bar design.',svc:['Press in 4 retaining clips','Disconnect active grille shutter wiring'],mnt:{'Cleaning':'Weekly minimum'},spec:{Type:'Vertical bar',ACC:'Radar aperture'},tor:'Hand tight',rel:['front_bumper_assembly'],par:'Front Bumper Assembly',chi:[]},
};

// ═══════════════════════════════════════════════════════════════
// SEMANTIC KEYWORDS
// ═══════════════════════════════════════════════════════════════
const SEM = {
  engine:['engine_block','cylinder_head','turbocharger','exhaust_manifold','engine_hood'],
  turbo:['turbocharger','intercooler','exhaust_manifold'],
  brake:['brake_caliper_fl','brake_caliper_fr','brake_caliper_rl','brake_caliper_rr','brake_disc_fl','brake_disc_fr','brake_disc_rl','brake_disc_rr','abs_control_module'],
  wheel:['tire_fl','tire_fr','tire_rl','tire_rr','rim_fl','rim_fr','rim_rl','rim_rr'],
  tyre:['tire_fl','tire_fr','tire_rl','tire_rr'],
  tire:['tire_fl','tire_fr','tire_rl','tire_rr'],
  suspension:['wishbone_upper_fl','wishbone_upper_fr','wishbone_upper_rl','wishbone_upper_rr','shock_absorber_fl','shock_absorber_fr','shock_absorber_rl','shock_absorber_rr','coil_spring_fl','coil_spring_fr','coil_spring_rl','coil_spring_rr','anti_roll_bar_front','anti_roll_bar_rear'],
  damper:['shock_absorber_fl','shock_absorber_fr','shock_absorber_rl','shock_absorber_rr'],
  spring:['coil_spring_fl','coil_spring_fr','coil_spring_rl','coil_spring_rr'],
  door:['door_front_left','door_front_right','door_rear_left','door_rear_right'],
  seat:['seat_front_left','seat_front_right'],
  light:['headlight_left','headlight_right','taillight_left','taillight_right','drl_left','drl_right','brake_light_center'],
  headlight:['headlight_left','headlight_right','drl_left','drl_right'],
  taillight:['taillight_left','taillight_right'],
  exhaust:['exhaust_manifold','exhaust_pipe_left','exhaust_pipe_right','exhaust_tip_left','exhaust_tip_right','catalytic_converter'],
  interior:['dashboard_assembly','steering_wheel','seat_front_left','seat_front_right','center_console','infotainment_screen'],
  glass:['windshield_front','windshield_rear'],
  aero:['front_splitter','rear_diffuser','roof_spoiler'],
  fuel:['fuel_tank','fuel_pump'],
  cooling:['radiator','intercooler'],
  electrical:['ecu_main','battery_12v','alternator','fuse_box'],
  transmission:['gearbox_8spd','transfer_case','driveshaft_rear'],
  body:['engine_hood','roof_panel','trunk_lid','front_bumper_assembly','rear_bumper_assembly'],
  chassis:['chassis_frame','front_subframe','rear_subframe'],
  'front left':['tire_fl','rim_fl','brake_caliper_fl','shock_absorber_fl'],
  'front right':['tire_fr','rim_fr','brake_caliper_fr','shock_absorber_fr'],
  'rear left':['tire_rl','rim_rl','brake_caliper_rl','shock_absorber_rl'],
  'rear right':['tire_rr','rim_rr','brake_caliper_rr','shock_absorber_rr'],
};

// ═══════════════════════════════════════════════════════════════
// SCENE GLOBALS
// ═══════════════════════════════════════════════════════════════
let scene, camera, renderer, controls;
let carGroup;
const meshMap = {};
const origColors = {};
let selectedId = null;
let wireMode = false, xrayMode = false, explodeMode = false;
const explodeOrigins = {};
const raycaster = new THREE.Raycaster();
const mouse2 = new THREE.Vector2();
let fpsCount = 0, fpsLast = 0;

// ═══════════════════════════════════════════════════════════════
// SCENE INIT
// ═══════════════════════════════════════════════════════════════
function initScene() {
  const canvas = document.getElementById('car-canvas');
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0A0E18);
  scene.fog = new THREE.Fog(0x0A0E18, 18, 40);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.position.set(4.5, 2.8, 5.5);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 1;
  controls.maxDistance = 18;
  controls.target.set(0, 0.7, 0);
  controls.update();

  // ── LIGHTS ──────────────────────────────────────────────────
  // Strong ambient so nothing is pitch black
  var amb = new THREE.AmbientLight(0xCCDDFF, 0.9);
  scene.add(amb);

  // Main sun
  var sun = new THREE.DirectionalLight(0xFFFFFF, 1.6);
  sun.position.set(5, 10, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 1024;
  sun.shadow.mapSize.height = 1024;
  scene.add(sun);

  // Fill from opposite side
  var fill = new THREE.DirectionalLight(0x88AAFF, 0.6);
  fill.position.set(-5, 4, -4);
  scene.add(fill);

  // Warm rim/back light
  var rim = new THREE.DirectionalLight(0xFFCC44, 0.5);
  rim.position.set(0, 3, -8);
  scene.add(rim);

  // Floor point lights for chassis illumination
  var under = new THREE.PointLight(0x4488FF, 0.8, 6);
  under.position.set(0, -0.5, 0);
  scene.add(under);

  // ── GROUND ──────────────────────────────────────────────────
  var gMat = new THREE.MeshPhongMaterial({ color: 0x101828 });
  var ground = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), gMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  var grid = new THREE.GridHelper(28, 36, 0x1E3050, 0x162035);
  grid.position.y = 0.003;
  scene.add(grid);

  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ═══════════════════════════════════════════════════════════════
// MATERIAL PALETTE (MeshPhongMaterial — always visible)
// ═══════════════════════════════════════════════════════════════
function mkPh(hex, spec, shi) {
  return new THREE.MeshPhongMaterial({ color: hex, specular: spec || 0x222222, shininess: shi || 30 });
}

var PAL = {
  body:    mkPh(0xBEC2CC, 0x555566, 60),
  dark:    mkPh(0x1C1C22, 0x333344, 20),
  glass:   new THREE.MeshPhongMaterial({ color:0x88AACC, transparent:true, opacity:0.42, specular:0xFFFFFF, shininess:120, side:THREE.DoubleSide }),
  tire:    mkPh(0x1A1A1A, 0x111111, 5),
  rim:     mkPh(0xA0A0A8, 0xBBBBCC, 90),
  steel:   mkPh(0x8090A0, 0x445566, 40),
  caliper: mkPh(0xCC1111, 0x882222, 50),
  disc:    mkPh(0x505060, 0x334455, 25),
  headlgt: new THREE.MeshPhongMaterial({ color:0xEEEEFF, emissive:0x888840, emissiveIntensity:1.0, shininess:80 }),
  tailgt:  new THREE.MeshPhongMaterial({ color:0xFF2020, emissive:0xAA0000, emissiveIntensity:0.8, shininess:60 }),
  engine:  mkPh(0x222230, 0x333344, 15),
  exhaust: mkPh(0x909090, 0xAAAAAA, 50),
  carbon:  mkPh(0x0E0E14, 0x222233, 12),
  leather: mkPh(0x101010, 0x222222, 8),
  plastic: mkPh(0x151520, 0x111122, 5),
  battery: mkPh(0x0E1826, 0x223344, 10),
  spring:  mkPh(0x606070, 0x8899AA, 35),
  screen:  new THREE.MeshPhongMaterial({ color:0x001020, emissive:0x001840, emissiveIntensity:1.2, shininess:100 }),
  gold:    mkPh(0xC9A84C, 0xFFCC66, 80),
};

// ═══════════════════════════════════════════════════════════════
// BUILD CAR
// ═══════════════════════════════════════════════════════════════
function buildCar() {
  carGroup = new THREE.Group();
  scene.add(carGroup);

  function box(w, h, d) { return new THREE.BoxGeometry(w, h, d); }
  function cyl(r, h, s)  { return new THREE.CylinderGeometry(r, r, h, s || 24); }
  function tor(r, t)     { return new THREE.TorusGeometry(r, t, 12, 36); }

  var H = Math.PI / 2;

  function mk(id, geo, pal, px, py, pz, rx, ry, rz) {
    var mat = pal.clone();
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(px, py, pz);
    if (rx !== undefined) mesh.rotation.set(rx, ry || 0, rz || 0);
    mesh.name = id;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    carGroup.add(mesh);
    meshMap[id] = mesh;
    origColors[id] = pal.color ? pal.color.getHex() : 0x888888;
    return mesh;
  }

  // ── CHASSIS ─────────────────────────────────────────────────
  mk('chassis_frame',   box(3.8,0.12,1.7),  PAL.steel,   0,0.08,0);
  mk('front_subframe',  box(1.6,0.09,1.5),  PAL.steel,   0,0.10, 1.14);
  mk('rear_subframe',   box(1.45,0.09,1.4), PAL.steel,   0,0.10,-1.2);

  // ── LOWER BODY ───────────────────────────────────────────────
  mk('body_lower_shell',box(3.72,0.44,1.74),PAL.body,    0,0.32,0);
  mk('front_fender_left', box(1.38,0.52,0.08),PAL.body, -0.88,0.63, 1.14);
  mk('front_fender_right',box(1.38,0.52,0.08),PAL.body,  0.88,0.63, 1.14);

  // Rear quarters
  mk('rear_quarter_panel_left', box(1.34,0.52,0.08),PAL.body, -0.88,0.63,-1.1);
  mk('rear_quarter_panel_right',box(1.34,0.52,0.08),PAL.body,  0.88,0.63,-1.1);

  // Doors
  mk('door_front_left',  box(0.06,0.66,0.9), PAL.body, -0.9,0.65, 0.32);
  mk('door_front_right', box(0.06,0.66,0.9), PAL.body,  0.9,0.65, 0.32);
  mk('door_rear_left',   box(0.06,0.66,0.86),PAL.body, -0.9,0.65,-0.55);
  mk('door_rear_right',  box(0.06,0.66,0.86),PAL.body,  0.9,0.65,-0.55);

  // Hood / Roof / Trunk
  mk('engine_hood', box(1.52,0.054,1.68),PAL.carbon,  0,0.74, 1.08);
  mk('roof_panel',  box(1.88,0.058,1.36),PAL.carbon,  0,1.22, 0.12);
  mk('trunk_lid',   box(1.14,0.045,1.68),PAL.body,    0,0.74,-1.24);

  // Bumpers
  mk('front_bumper_assembly',box(0.21,0.47,1.76),PAL.dark,  0,0.41, 1.94);
  mk('rear_bumper_assembly', box(0.21,0.50,1.76),PAL.dark,  0,0.42,-1.93);
  mk('front_grille',         box(0.04,0.28,1.18),PAL.plastic,0,0.48, 1.98);

  // ── GLASS ────────────────────────────────────────────────────
  mk('windshield_front',box(1.82,0.8,0.04), PAL.glass,  0,0.98, 0.87,-0.22,0,0);
  mk('windshield_rear', box(1.72,0.64,0.04),PAL.glass,  0,0.97,-0.69, 0.30,0,0);

  // ── LIGHTS ───────────────────────────────────────────────────
  mk('headlight_left',  box(0.38,0.14,0.06),PAL.headlgt,-0.62,0.58,1.96);
  mk('headlight_right', box(0.38,0.14,0.06),PAL.headlgt, 0.62,0.58,1.96);
  mk('drl_left',        box(0.44,0.04,0.04),PAL.headlgt,-0.54,0.47,1.97);
  mk('drl_right',       box(0.44,0.04,0.04),PAL.headlgt, 0.54,0.47,1.97);
  mk('taillight_left',  box(0.42,0.12,0.05),PAL.tailgt, -0.68,0.55,-1.96);
  mk('taillight_right', box(0.42,0.12,0.05),PAL.tailgt,  0.68,0.55,-1.96);
  mk('brake_light_center',box(1.40,0.04,0.04),PAL.tailgt, 0,0.68,-1.95);

  // ── WHEELS ───────────────────────────────────────────────────
  var corners = [
    {s:'fl',x:-0.94,z: 1.22},{s:'fr',x:0.94,z: 1.22},
    {s:'rl',x:-0.94,z:-1.22},{s:'rr',x:0.94,z:-1.22}
  ];
  corners.forEach(function(c) {
    var sx = c.x < 0 ? 0.1 : -0.1;
    mk('tire_'+c.s,         cyl(0.33,0.24,32), PAL.tire,   c.x,0.33,c.z, 0,0,H);
    mk('rim_'+c.s,          cyl(0.26,0.25,20), PAL.rim,    c.x,0.33,c.z, 0,0,H);
    mk('brake_disc_'+c.s,   cyl(0.22,0.028,20),PAL.disc,   c.x+sx,0.33,c.z, 0,0,H);
    mk('brake_caliper_'+c.s,box(0.17,0.1,0.08),PAL.caliper,c.x+sx*1.1,0.35,c.z);
  });

  // ── SUSPENSION ───────────────────────────────────────────────
  corners.forEach(function(c) {
    var xs = c.x * 0.62;
    mk('wishbone_upper_'+c.s, box(0.42,0.04,0.07),PAL.steel, xs,0.37,c.z);
    mk('shock_absorber_'+c.s, cyl(0.026,0.42,10), PAL.steel, c.x*0.78,0.38,c.z);
    mk('coil_spring_'+c.s,    cyl(0.044,0.26,10), PAL.spring,c.x*0.78,0.28,c.z);
  });
  mk('anti_roll_bar_front',cyl(0.017,1.6,10),PAL.steel, 0,0.21, 1.22, 0,0,H);
  mk('anti_roll_bar_rear', cyl(0.017,1.6,10),PAL.steel, 0,0.21,-1.22, 0,0,H);

  // ── ENGINE BAY ───────────────────────────────────────────────
  mk('engine_block',    box(0.72,0.46,1.06),PAL.engine,  0,0.52,1.0);
  mk('cylinder_head',   box(0.70,0.12,1.04),PAL.engine,  0,0.82,1.0);
  mk('turbocharger',    box(0.21,0.21,0.22),PAL.steel,   0.28,0.87,0.84);
  mk('intercooler',     box(0.08,0.21,0.54),PAL.steel,   0,0.72,1.7);
  mk('exhaust_manifold',box(0.07,0.14,0.88),PAL.exhaust, 0.29,0.62,1.0);
  mk('intake_manifold', box(0.07,0.12,0.84),PAL.engine, -0.27,0.78,1.0);
  mk('radiator',        box(0.07,0.56,1.3), PAL.steel,   0,0.52,1.76);
  mk('battery_12v',     box(0.23,0.17,0.34),PAL.battery,-0.47,0.82,1.1);
  mk('alternator',      cyl(0.078,0.14,14), PAL.engine,  0.32,0.52,0.72);
  mk('ecu_main',        box(0.21,0.05,0.17),PAL.plastic, 0.3,0.72,0.95);
  mk('fuse_box',        box(0.17,0.1,0.21), PAL.plastic,-0.51,0.78,1.28);
  mk('engine_oil_pan',  box(0.64,0.1,0.89), PAL.steel,   0,0.22,1.0);
  mk('fuel_pump',       cyl(0.048,0.24,10), PAL.plastic, 0,0.1,-0.94, H,0,0);
  mk('fuel_tank',       box(0.76,0.18,0.86),PAL.steel,   0,0.18,-0.94);

  // ── TRANSMISSION ─────────────────────────────────────────────
  mk('gearbox_8spd',    box(0.33,0.27,0.57),PAL.engine,  0,0.30,0.45);
  mk('transfer_case',   box(0.27,0.23,0.29),PAL.engine,  0,0.28,0.15);
  mk('driveshaft_rear', cyl(0.024,1.68,10), PAL.steel,   0,0.20,-0.6, H,0,0);

  // ── EXHAUST ──────────────────────────────────────────────────
  mk('exhaust_pipe_left',  cyl(0.036,2.38,10),PAL.exhaust,-0.41,0.18,-0.7, H,0,0);
  mk('exhaust_pipe_right', cyl(0.036,2.38,10),PAL.exhaust, 0.41,0.18,-0.7, H,0,0);
  mk('exhaust_tip_left',   cyl(0.056,0.12,14),PAL.steel,  -0.41,0.18,-1.95, H,0,0);
  mk('exhaust_tip_right',  cyl(0.056,0.12,14),PAL.steel,   0.41,0.18,-1.95, H,0,0);
  mk('catalytic_converter',cyl(0.068,0.31,14),PAL.steel,   0,0.18,-0.54, H,0,0);

  // ── INTERIOR ─────────────────────────────────────────────────
  mk('dashboard_assembly',  box(0.09,0.46,1.50),PAL.dark,    0,0.84,0.82);
  mk('infotainment_screen', box(0.04,0.27,0.33),PAL.screen,  0,0.83,0.76);
  mk('steering_wheel',      tor(0.17,0.025),    PAL.leather, -0.39,0.90,0.65);
  mk('seat_front_left',     box(0.47,0.51,0.54),PAL.leather, -0.41,0.50,0.20);
  mk('seat_front_right',    box(0.47,0.51,0.54),PAL.leather,  0.41,0.50,0.20);
  mk('center_console',      box(0.21,0.43,0.77),PAL.carbon,   0,0.54,0.16);

  // ── AERO ─────────────────────────────────────────────────────
  mk('front_splitter',box(0.04,0.05,1.82),PAL.carbon, 0,0.18,1.97);
  mk('rear_diffuser', box(0.05,0.17,1.74),PAL.carbon, 0,0.15,-1.97);
  mk('roof_spoiler',  box(1.72,0.07,0.17),PAL.carbon, 0,1.23,-0.67);

  // ── BRAKE SYSTEM ─────────────────────────────────────────────
  mk('brake_master_cylinder',cyl(0.038,0.21,10),PAL.steel,  -0.31,0.72,0.92);
  mk('abs_control_module',   box(0.14,0.08,0.11),PAL.plastic,-0.19,0.24,1.34);
  mk('power_steering_pump',  cyl(0.063,0.10,14), PAL.engine,  0.27,0.52,0.6);

  return Object.keys(meshMap).length;
}

// ═══════════════════════════════════════════════════════════════
// HIGHLIGHT
// ═══════════════════════════════════════════════════════════════
function highlightPart(id) {
  Object.keys(meshMap).forEach(function(k) {
    var mat = meshMap[k].material;
    if (k === id) {
      mat.color.setHex(0xFFCC00);
      mat.emissive && mat.emissive.setHex(0x886600);
      mat.transparent = false;
      mat.opacity = 1;
    } else {
      mat.color.setHex(origColors[k] || 0x444444);
      mat.emissive && mat.emissive.setHex(0x000000);
      mat.transparent = true;
      mat.opacity = 0.10;
    }
  });
}

function resetHighlight() {
  Object.keys(meshMap).forEach(function(k) {
    var mat = meshMap[k].material;
    mat.color.setHex(origColors[k] || 0x888888);
    mat.emissive && mat.emissive.setHex(0x000000);
    mat.transparent = k === 'windshield_front' || k === 'windshield_rear' ? true : false;
    mat.opacity = (k === 'windshield_front' || k === 'windshield_rear') ? 0.42 : 1;
  });
}

// ═══════════════════════════════════════════════════════════════
// CAMERA FLY-TO
// ═══════════════════════════════════════════════════════════════
var flyAnim = null;
function flyTo(id) {
  var mesh = meshMap[id];
  if (!mesh) return;
  var box3 = new THREE.Box3().setFromObject(mesh);
  var ctr = box3.getCenter(new THREE.Vector3());
  var sz = box3.getSize(new THREE.Vector3());
  var dist = Math.max(Math.max(sz.x, sz.y, sz.z) * 3.2, 1.2);
  var tgt = new THREE.Vector3(ctr.x + dist * 0.55, ctr.y + dist * 0.4, ctr.z + dist * 0.75);
  var p0 = camera.position.clone();
  var t0 = controls.target.clone();
  var dur = 800, ts = performance.now();
  cancelAnimationFrame(flyAnim);
  function tick() {
    var t = Math.min((performance.now() - ts) / dur, 1);
    var e = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(p0, tgt, e);
    controls.target.lerpVectors(t0, ctr, e);
    controls.update();
    if (t < 1) flyAnim = requestAnimationFrame(tick);
  }
  tick();
}

function resetCamera() {
  var p0 = camera.position.clone(), t0 = controls.target.clone();
  var tgt = new THREE.Vector3(4.5, 2.8, 5.5), look = new THREE.Vector3(0, 0.7, 0);
  var dur = 800, ts = performance.now();
  function tick() {
    var t = Math.min((performance.now() - ts) / dur, 1);
    var e = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(p0, tgt, e);
    controls.target.lerpVectors(t0, look, e);
    controls.update();
    if (t < 1) requestAnimationFrame(tick);
  }
  tick();
}

// ═══════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════
function searchParts(q) {
  if (!q || q.length < 2) return [];
  var ql = q.toLowerCase().trim();
  var results = [], seen = {};
  Object.keys(SEM).forEach(function(kw) {
    if (ql.indexOf(kw) >= 0 || kw.indexOf(ql) >= 0) {
      SEM[kw].forEach(function(id) { if (!seen[id] && DB[id]) { seen[id]=1; results.push({id:id,score:0.96}); }});
    }
  });
  Object.keys(DB).forEach(function(id) {
    if (seen[id]) return;
    var p = DB[id], score = 0;
    var nm = p.n.toLowerCase();
    if (nm.indexOf(ql) >= 0) score = 0.92;
    else if (p.pn.toLowerCase().indexOf(ql) >= 0) score = 0.88;
    else if (p.asm.toLowerCase().indexOf(ql) >= 0) score = 0.75;
    else { var h = ql.split('').filter(function(c){return nm.indexOf(c)>=0;}).length; score = (h/ql.length)*0.55; }
    if (score > 0.4) { seen[id]=1; results.push({id:id,score:score}); }
  });
  return results.sort(function(a,b){return b.score-a.score;}).slice(0,9);
}

// ═══════════════════════════════════════════════════════════════
// SELECT PART
// ═══════════════════════════════════════════════════════════════
function selectPart(id, conf) {
  conf = conf || 0.96;
  selectedId = id;
  var p = DB[id];
  if (!p) return;

  highlightPart(id);
  flyTo(id);

  document.querySelectorAll('.part-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.id === id);
  });

  showPartInfo(id, p, conf);
  document.getElementById('panelR').classList.remove('hidden');
  document.getElementById('sbSel').textContent = p.n;
  showToast(p.ico + ' ' + p.n, 'Confidence: ' + Math.round(conf*100) + '%');

  setScan(true,'AI MATCHING...');
  setTimeout(function(){ setScan(false); }, 600);
}

function deselectPart() {
  selectedId = null;
  resetHighlight();
  document.querySelectorAll('.part-item').forEach(function(el){ el.classList.remove('active'); });
  document.getElementById('panelR').classList.add('hidden');
  document.getElementById('sbSel').textContent = 'No Selection';
}

// ═══════════════════════════════════════════════════════════════
// PARTS LIST
// ═══════════════════════════════════════════════════════════════
var CAT_ORDER = ['powertrain','chassis','suspension','body','interior'];
var CAT_LBL = {powertrain:'🔥 Powertrain',chassis:'⚙️ Chassis & Brakes',suspension:'🔩 Suspension',body:'🚗 Body & Glazing',interior:'💺 Interior'};

function buildPartsList() {
  var container = document.getElementById('partsList');
  container.innerHTML = '';
  var bycat = {};
  Object.keys(DB).forEach(function(id) {
    var c = DB[id].cat;
    if (!bycat[c]) bycat[c] = [];
    bycat[c].push(id);
  });
  CAT_ORDER.forEach(function(cat) {
    if (!bycat[cat]) return;
    var lbl = document.createElement('div');
    lbl.className = 'cat-label';
    lbl.textContent = CAT_LBL[cat] || cat;
    container.appendChild(lbl);
    bycat[cat].forEach(function(id) {
      var p = DB[id];
      var item = document.createElement('div');
      item.className = 'part-item';
      item.dataset.id = id;
      item.innerHTML = '<span class="pi-icon">'+p.ico+'</span><span class="pi-name">'+p.n+'</span><span class="pi-dot '+(p.h||'ok')+'"></span>';
      item.addEventListener('click', function(){ selectPart(id); });
      container.appendChild(item);
    });
  });
  var total = Object.keys(DB).length;
  document.getElementById('partsBadge').textContent = total + ' Parts';
  document.getElementById('sbParts').textContent = total + ' Parts Indexed';
}

// ═══════════════════════════════════════════════════════════════
// PART INFO PANEL
// ═══════════════════════════════════════════════════════════════
function showPartInfo(id, p, conf) {
  document.getElementById('noSel').style.display = 'none';
  var pi = document.getElementById('partInfo');
  pi.style.display = 'flex';

  document.getElementById('piNum').textContent  = p.pn;
  document.getElementById('piName').textContent = p.n;
  document.getElementById('piAsm').textContent  = '📍 ' + p.asm;

  var hb = document.getElementById('piHbadge');
  hb.textContent = p.h==='ok' ? 'OPERATIONAL' : p.h==='warning' ? 'NEEDS CHECK' : 'CRITICAL';
  hb.className = 'hbadge '+(p.h==='ok'?'ok':p.h==='warning'?'warn':'crit');

  var pct = Math.round(conf*100);
  document.getElementById('piConf').style.width = pct+'%';
  document.getElementById('piConfPct').textContent = pct+'%';

  document.querySelectorAll('.pi-tab').forEach(function(t){t.classList.remove('active');});
  document.querySelectorAll('.tab-pane').forEach(function(t){t.classList.remove('active');});
  document.querySelector('[data-tab="specs"]').classList.add('active');
  document.getElementById('tab-specs').classList.add('active');

  var specHtml = '<div class="spec-lbl-row">Technical Specifications</div><div class="spec-grid">';
  specHtml += '<div class="spec-item"><div class="spec-k">Material</div><div class="spec-v">'+p.mat+'</div></div>';
  specHtml += '<div class="spec-item"><div class="spec-k">Weight</div><div class="spec-v">'+p.wt+'</div></div>';
  Object.keys(p.spec||{}).forEach(function(k) {
    specHtml += '<div class="spec-item"><div class="spec-k">'+k+'</div><div class="spec-v">'+p.spec[k]+'</div></div>';
  });
  specHtml += '<div class="spec-item"><div class="spec-k">Torque Spec</div><div class="spec-v gold">'+p.tor+'</div></div>';
  specHtml += '</div>';
  document.getElementById('piSpecs').innerHTML = specHtml;

  var hierHtml = '<div class="spec-lbl-row" style="margin-bottom:5px">Hierarchy</div><div class="hier-chain">';
  hierHtml += '<div class="hier-item parent">▲ '+p.par+'</div>';
  hierHtml += '<div class="hier-item current">● '+p.n+'</div>';
  (p.chi||[]).forEach(function(c){ if(DB[c]) hierHtml += '<div class="hier-item child" onclick="selectPart(\''+c+'\')">▼ '+DB[c].n+'</div>'; });
  hierHtml += '</div>';
  document.getElementById('piHier').innerHTML = hierHtml;

  var relHtml = '<div class="spec-lbl-row">Related Parts</div>';
  (p.rel||[]).forEach(function(r){ if(DB[r]) relHtml += '<div class="rel-chip" onclick="selectPart(\''+r+'\')">'+DB[r].ico+' '+DB[r].n+'</div>'; });
  document.getElementById('piRelated').innerHTML = relHtml;

  document.getElementById('piSvc').innerHTML = (p.svc||['No data.']).map(function(s,i){
    return '<div class="svc-step"><div class="step-num">'+(i+1)+'</div><div>'+s+'</div></div>';
  }).join('');

  document.getElementById('piMaint').innerHTML = Object.keys(p.mnt||{}).map(function(task){
    return '<div class="maint-item"><span class="maint-task">🔧 '+task+'</span><span class="maint-int">'+p.mnt[task]+'</span></div>';
  }).join('') || '<div style="padding:14px;color:#475569;font-size:.75rem">No scheduled maintenance data.</div>';

  document.getElementById('piAi').innerHTML =
    '<div class="ai-box-head">🤖 AtlasAI Reasoning</div>'+
    '<div class="ai-ev"><span class="ai-ev-check">✓</span> Part identified: <strong>'+p.n+'</strong></div>'+
    '<div class="ai-ev"><span class="ai-ev-check">✓</span> Assembly: '+p.asm+'</div>'+
    '<div class="ai-ev"><span class="ai-ev-check">✓</span> Confidence: '+pct+'%</div>'+
    '<div class="ai-ev"><span class="ai-ev-check">✓</span> Related parts: '+(p.rel||[]).length+' linked</div>'+
    '<div style="margin-top:10px;padding:8px;background:rgba(201,168,76,.07);border-radius:6px;font-size:.72rem;color:#94A3B8;line-height:1.5">'+p.desc+'</div>';
}

// Tab switching
document.querySelectorAll('.pi-tab').forEach(function(tab){
  tab.addEventListener('click', function(){
    document.querySelectorAll('.pi-tab').forEach(function(t){t.classList.remove('active');});
    document.querySelectorAll('.tab-pane').forEach(function(t){t.classList.remove('active');});
    tab.classList.add('active');
    document.getElementById('tab-'+tab.dataset.tab).classList.add('active');
  });
});

// ═══════════════════════════════════════════════════════════════
// SEARCH DROPDOWN
// ═══════════════════════════════════════════════════════════════
var searchTm;
document.getElementById('carSearch').addEventListener('input', function(e){
  clearTimeout(searchTm);
  searchTm = setTimeout(function(){ renderDd(e.target.value); }, 160);
});
document.getElementById('carSearch').addEventListener('keydown', function(e){
  if (e.key === 'Escape') closeDd();
  if (e.key === 'Enter') { var r = searchParts(e.target.value)[0]; if(r){ selectPart(r.id); closeDd(); e.target.value=''; } }
});
document.addEventListener('click', function(e){ if(!e.target.closest('.g-search-wrap')) closeDd(); });

function closeDd() { document.getElementById('searchDd').classList.remove('open'); }

function renderDd(q) {
  var dd = document.getElementById('searchDd');
  var results = searchParts(q);
  if (!results.length) { dd.classList.remove('open'); return; }
  dd.innerHTML = results.map(function(r){
    var p = DB[r.id];
    return '<div class="sdd-item" data-id="'+r.id+'">'+
      '<div class="sdd-icon '+p.cat+'">'+p.ico+'</div>'+
      '<div class="sdd-info"><div class="sdd-name">'+p.n+'</div><div class="sdd-meta">'+p.pn+' · '+p.asm+'</div></div>'+
      '<div class="sdd-score">'+Math.round(r.score*100)+'%</div></div>';
  }).join('');
  dd.querySelectorAll('.sdd-item').forEach(function(el){
    el.addEventListener('click', function(){ selectPart(el.dataset.id); closeDd(); document.getElementById('carSearch').value=''; });
  });
  dd.classList.add('open');
}

// ═══════════════════════════════════════════════════════════════
// RAYCASTING
// ═══════════════════════════════════════════════════════════════
var tip = document.getElementById('hoverTip');
document.getElementById('car-canvas').addEventListener('mousemove', function(e){
  mouse2.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  mouse2.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse2, camera);
  var hits = raycaster.intersectObjects(Object.values(meshMap));
  if (hits.length) {
    var hid = hits[0].object.name;
    var hp = DB[hid];
    tip.style.left = e.clientX + 'px';
    tip.style.top  = e.clientY + 'px';
    document.getElementById('htId').textContent   = hid;
    document.getElementById('htName').textContent = hp ? hp.n : hid;
    document.getElementById('htAsm').textContent  = hp ? hp.asm : '';
    tip.classList.add('visible');
  } else {
    tip.classList.remove('visible');
  }
});
document.getElementById('car-canvas').addEventListener('click', function(){
  raycaster.setFromCamera(mouse2, camera);
  var hits = raycaster.intersectObjects(Object.values(meshMap));
  if (hits.length && DB[hits[0].object.name]) selectPart(hits[0].object.name);
  else deselectPart();
});

// ═══════════════════════════════════════════════════════════════
// VIEWER CONTROLS
// ═══════════════════════════════════════════════════════════════
document.getElementById('vReset').addEventListener('click', function(){ resetCamera(); resetHighlight(); deselectPart(); });

document.getElementById('vWire').addEventListener('click', function(){
  wireMode = !wireMode;
  this.classList.toggle('active', wireMode);
  Object.values(meshMap).forEach(function(m){ m.material.wireframe = wireMode; });
});

document.getElementById('vXray').addEventListener('click', function(){
  xrayMode = !xrayMode;
  this.classList.toggle('active', xrayMode);
  Object.values(meshMap).forEach(function(m){
    m.material.transparent = xrayMode;
    m.material.opacity = xrayMode ? 0.28 : 1.0;
  });
});

document.getElementById('vExplode').addEventListener('click', function(){
  explodeMode = !explodeMode;
  this.classList.toggle('active', explodeMode);
  if (explodeMode && Object.keys(explodeOrigins).length === 0) {
    Object.keys(meshMap).forEach(function(id){ explodeOrigins[id] = meshMap[id].position.clone(); });
  }
  var tf = explodeMode ? 1.5 : 0, sf = explodeMode ? 0 : 1.5, dur = 900, ts = performance.now();
  function animEx() {
    var t = Math.min((performance.now()-ts)/dur, 1), e = 1-Math.pow(1-t,3);
    Object.keys(meshMap).forEach(function(id){
      var o = explodeOrigins[id]; if (!o) return;
      var dir = o.clone().normalize();
      meshMap[id].position.copy(o).addScaledVector(dir, (sf+(tf-sf)*e)*0.55);
    });
    if (t < 1) requestAnimationFrame(animEx);
    else if (!explodeMode) { Object.keys(explodeOrigins).forEach(function(k){ delete explodeOrigins[k]; }); }
  }
  animEx();
});

// ═══════════════════════════════════════════════════════════════
// UPLOAD MODAL
// ═══════════════════════════════════════════════════════════════
document.getElementById('openUpload').addEventListener('click', function(){ document.getElementById('uploadOverlay').classList.add('on'); });
document.getElementById('closeUpload').addEventListener('click', function(){
  document.getElementById('uploadOverlay').classList.remove('on');
  document.getElementById('uploadProg').classList.remove('on');
  document.getElementById('upFill').style.width='0%';
});

var dz = document.getElementById('dropZone');
dz.addEventListener('dragover', function(e){ e.preventDefault(); dz.classList.add('drag-on'); });
dz.addEventListener('dragleave', function(){ dz.classList.remove('drag-on'); });
dz.addEventListener('drop', function(e){ e.preventDefault(); dz.classList.remove('drag-on'); if(e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]); });
document.getElementById('fileInput').addEventListener('change', function(e){ if(e.target.files[0]) handleUpload(e.target.files[0]); });

function handleUpload(file) {
  var prog = document.getElementById('uploadProg');
  var fill = document.getElementById('upFill');
  var txt  = document.getElementById('upTxt');
  prog.classList.add('on');
  var steps = ['Loading model...','Extracting geometry...','Computing bounding box...','Comparing 85 car parts...','Running AI matcher...'];
  var i = 0;
  function step() {
    if (i >= steps.length) { finish(); return; }
    txt.textContent = steps[i];
    fill.style.width = ((i+1)/steps.length*80)+'%';
    i++; setTimeout(step, 340);
  }
  function finish() {
    fill.style.width = '100%';
    var fn = file.name.toLowerCase().replace(/[._-]/g,' ');
    var results = searchParts(fn);
    var matched = results.length ? results[0].id : guessFromFilename(fn);
    txt.textContent = 'Matched: ' + (DB[matched] ? DB[matched].n : 'Unknown');
    setTimeout(function(){
      document.getElementById('uploadOverlay').classList.remove('on');
      prog.classList.remove('on');
      fill.style.width='0%';
      if (matched && DB[matched]) selectPart(matched, results.length ? results[0].score : 0.72);
    }, 600);
  }
  step();
}

function guessFromFilename(fn) {
  if (fn.indexOf('engine')>=0) return 'engine_block';
  if (fn.indexOf('turbo')>=0)  return 'turbocharger';
  if (fn.indexOf('brake')>=0)  return 'brake_caliper_fl';
  if (fn.indexOf('wheel')>=0)  return 'rim_fl';
  if (fn.indexOf('door')>=0)   return 'door_front_left';
  if (fn.indexOf('seat')>=0)   return 'seat_front_left';
  if (fn.indexOf('hood')>=0)   return 'engine_hood';
  return 'engine_block';
}

// ═══════════════════════════════════════════════════════════════
// TOAST / SCAN
// ═══════════════════════════════════════════════════════════════
var toastTm;
function showToast(title, sub) {
  var t = document.getElementById('matchToast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastSub').textContent = sub;
  t.classList.add('on');
  clearTimeout(toastTm);
  toastTm = setTimeout(function(){ t.classList.remove('on'); }, 3000);
}

function setScan(on, txt) {
  document.getElementById('aiScan').classList.toggle('on', on);
  if (txt) document.getElementById('scanTxt').textContent = txt;
}

// ═══════════════════════════════════════════════════════════════
// ANIMATION LOOP
// ═══════════════════════════════════════════════════════════════
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  fpsCount++;
  var now = performance.now();
  if (now - fpsLast >= 1000) {
    document.getElementById('fps').textContent = fpsCount;
    fpsCount = 0; fpsLast = now;
  }
}

// ═══════════════════════════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', function() {
  try {
    setScan(true, 'INITIALIZING AI ENGINE...');
    initScene();

    setTimeout(function() {
      try {
        setScan(true, 'BUILDING BMW M4 MODEL...');
        var count = buildCar();

        setTimeout(function() {
          try {
            setScan(true, 'INDEXING ' + count + ' PARTS...');
            buildPartsList();

            setTimeout(function() {
              setScan(false);
              document.getElementById('sbParts').textContent = Object.keys(DB).length + ' Parts Indexed';
              animate();
            }, 400);
          } catch(e3) { console.error('buildPartsList error:', e3); setScan(false); animate(); }
        }, 300);

      } catch(e2) { console.error('buildCar error:', e2); setScan(false); animate(); }
    }, 200);

  } catch(e1) { console.error('initScene error:', e1); }
});

// Global helper for inline onclick
window.selectPart = selectPart;
