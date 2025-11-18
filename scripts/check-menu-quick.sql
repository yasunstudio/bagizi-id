-- Count menus
SELECT 'Total Menus' as type, COUNT(*) as count 
FROM nutrition_menus nm
JOIN nutrition_programs np ON nm."programId" = np.id
JOIN sppgs s ON np."sppgId" = s.id
WHERE s.email = 'admin@demo.sppg.id';

-- Count menu ingredients  
SELECT 'Total Ingredients' as type, COUNT(*) as count
FROM menu_ingredients mi
JOIN nutrition_menus nm ON mi."menuId" = nm.id
JOIN nutrition_programs np ON nm."programId" = np.id
JOIN sppgs s ON np."sppgId" = s.id
WHERE s.email = 'admin@demo.sppg.id';

-- Count recipe steps
SELECT 'Total Recipe Steps' as type, COUNT(*) as count
FROM recipe_steps rs
JOIN nutrition_menus nm ON rs."menuId" = nm.id
JOIN nutrition_programs np ON nm."programId" = np.id
JOIN sppgs s ON np."sppgId" = s.id
WHERE s.email = 'admin@demo.sppg.id';
