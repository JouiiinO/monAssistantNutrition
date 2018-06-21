// dependencie to get rid of html tags
const striptags = require('striptags');

// send templates dependency
const sentTemplates = require('./sendTemplates.js');

const getListNoDoublon = (list) => {
  let listNoDuplication = '';
  Array.from(new Set(list)).map((product) => {
    listNoDuplication += `- ${product.charAt(0).toUpperCase()}${product.substring(1)}\n`;
    return true;
  });
  return listNoDuplication;
};

exports.welcome = (senderID) => {
  sentTemplates.textMessage(senderID, 'Bienvenue ! 👋👋👋', null, () => {
    sentTemplates.textMessage(senderID, 'Mon fonctionnement est simple ! Envois moi un nom de produit alimentaire comme "Nutella" ou "Petit écolier" et je te donnerai plein d\'informations interessantes concernant ce produit 😊');
  });
};

exports.findNutritionGradeMessage = (nutritionGrade) => {
  let toReturn = '';
  switch (nutritionGrade) {
    case 'a':
      toReturn = 'A';
      break;
    case 'b':
      toReturn = 'B';
      break;
    case 'c':
      toReturn = 'C';
      break;
    case 'd':
      toReturn = 'D';
      break;
    case 'e':
      toReturn = 'E';
      break;
    default:
      toReturn = 'No idea 👀';
  }

  return toReturn;
};

exports.nutritionFactsMessage = (product) => {
  let productToReturn = `Detail nutritionel pour ${product.nutrition_data_per} :\n`;
  productToReturn += (product.nutriments.energy_value) ? `- Energie : ${product.nutriments.energy_value} ${product.nutriments.energy_unit}\n` : '';
  productToReturn += (product.nutriments.fat) ? `- Matières grasses : ${product.nutriments.fat} g (dont acides gras saturés : ${product.nutriments['saturated-fat']} g)\n` : '';
  productToReturn += (product.nutriments.carbohydrates_value) ? `- Glucides : ${product.nutriments.carbohydrates_value} g (dont sucre : ${product.nutriments.sugars} g)\n` : '';
  productToReturn += (product.nutriments.salt_value) ? `- Sel: ${product.nutriments.salt_value} g (dont sodium : ${product.nutriments.sodium} g)\n` : '';
  productToReturn += (product.nutriments.proteins) ? `- Proteine : ${product.nutriments.proteins} g\n` : '';
  productToReturn += (product.nutriments.fiber) ? `- Fibres alimentaires : ${product.nutriments.fiber} g\n` : '';

  return productToReturn;
};

exports.ingredientsMessage = (product) => {
  if (product.ingredients_text_with_allergens_fr) {
    let productToReturn = 'Liste des ingrédients : \n';

    productToReturn += getListNoDoublon(striptags(product.ingredients_text_with_allergens_fr).split(', '));

    return productToReturn;
  }

  return 'Impossible de recuperer la liste des ingrédients pour ce produit';
};

exports.palmOilMessage = (product) => {
  let productToReturn = '⚠️🚨⚠️\n';

  const filtering = (tags, text) => {
    if (tags.length > 0) {
      productToReturn += text;
      tags.map((ingredientToFind) => {
        productToReturn += getListNoDoublon(product.ingredients.filter((ingredient) => ingredientToFind === ingredient.id).map((ingredient) => ingredient.text));
        return true;
      });
    }
  };

  if (product.ingredients_from_or_that_may_be_from_palm_oil_n) {
    filtering(product.ingredients_from_palm_oil_tags, 'Ingrédient(s) contenant de l\'huile de palme :\n');
    filtering(product.ingredients_that_may_be_from_palm_oil_tags, 'Ingrédient(s) succeptible(s) de contenir de l\'huile de palme :\n');

    return productToReturn;
  }

  return '😅😅 Il n\'y a pas de trace d\'huile de palme dans ce produit';
};

exports.allergenMessage = (productAllergens) => {
  if (productAllergens) {
    return `Ce produit contient les allergènes suivants : \n${getListNoDoublon(productAllergens.split(', '))}`;
  }

  return 'Ce produit ne contient pas d\'allergènes';
};
