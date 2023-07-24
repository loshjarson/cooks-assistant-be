# cooks-assistant-be


- [Give it a star ⭐!](#give-it-a-star-)
- [Overview](#overview)
- [API Definition](#api-definition)
  - [Create Recipe](#create-recipe)
    - [Create Recipe Request](#create-recipe-request)
    - [Create Recipe Response](#create-recipe-response)
  - [Get Recipe](#get-recipe)
    - [Get Recipe Request](#get-recipe-request)
    - [Get Recipe Response](#get-recipe-response)
  - [Update Recipe](#update-recipe)
    - [Update Recipe Request](#update-recipe-request)
    - [Update Recipe Response](#update-recipe-response)
  - [Delete Recipe](#delete-recipe)
    - [Delete Recipe Request](#delete-recipe-request)
    - [Delete Recipe Response](#delete-recipe-response)
  - [Create Recipe List](#create-recipe-list)
    - [Create Recipe List Request](#create-recipe-list-request)
    - [Create Recipe List Response](#create-recipe-list-response)
  - [Get Recipe List](#get-recipe-list)
    - [Get Recipe List Request](#get-recipe-list-request)
    - [Get Recipe List Response](#get-recipe-list-response)
  - [Update Recipe List](#update-recipe-list)
    - [Update Recipe List Request](#update-recipe-list-request)
    - [Update Recipe List Response](#update-recipe-list-response)
  - [Delete Recipe List](#delete-recipe-list)
    - [Delete Recipe List Request](#delete-recipe-list-request)
    - [Delete Recipe List Response](#delete-recipe-list-response)
  - [Create Grocery List](#create-grocery-list)
    - [Create Grocery List Request](#create-grocery-list-request)
    - [Create Grocery List Response](#create-grocery-list-response)
  - [Get Grocery List](#get-grocery-list)
    - [Get Grocery List Request](#get-grocery-list-request)
    - [Get Grocery List Response](#get-grocery-list-response)
  - [Update Grocery List](#update-grocery-list)
    - [Update Grocery List Request](#update-grocery-list-request)
    - [Update Grocery List Response](#update-grocery-list-response)
  - [Delete Grocery List](#delete-grocery-list)
    - [Delete Grocery List Request](#delete-grocery-list-request)
    - [Delete Grocery List Response](#delete-grocery-list-response)


---

# Give it a star ⭐!

Loving it? Show your support by giving this project a star!

# Overview

REST API for Cooks Assistant


# API Definition


## Create Recipe

### Create Recipe Request

```js
POST /recipes
```
```json
Headers: {
    "authorization":"bearer 0000000-0000000-0000000",
    "Content-Type":"multipart/form-data",
}
```

```json
{
    "name": "Reuben Sandwich",
    "description": "A delicious sandwich to bring to the beach",
    "ingredients": [
        {
            "name": "slices of rye",
            "unit":"N/A",
            "amount":8  
        },
        {
            "name": "Thousand Island dressing",
            "unit":"cup",
            "amount":.5  
        },
        {
            "name": "slices Swiss cheese",
            "unit":"N/A",
            "amount":8  
        },
        {
            "name": "slices deli sliced corned beef",
            "unit":"N/A",
            "amount":8  
        },
        {
            "name": "sauerkraut, drained",
            "unit":"cup",
            "amount":1  
        },
        {
            "name": "butter, softened",
            "unit":"tablespoons",
            "amount":2  
        }
    ],
    "instructions": {
        "1":"Preheat a large griddle or skillet over medium heat.",
        "2":"Spread one side of bread slices evenly with Thousand Island dressing. On four bread slices, layer one slice Swiss cheese, 2 slices corned beef, 1/4 cup sauerkraut, and a second slice of Swiss cheese. Top with remaining bread slices, dressing-side down. Butter the top of each sandwich.",
        "3":"Place sandwiches, butter-side down on the preheated griddle; butter the top of each sandwich with remaining butter. Grill until both sides are golden brown, about 5 minutes per side. Serve hot.",
    },
    "prepTime": 10,
    "cookTime": 10,
    "totalTime": 20,
    "servings": 4,
    "owner": "00000xx000xx00000xx000000",
    "tags": ["savory","lunch","sandwich"],
    "image": File { uid: "rc-upload-1690220469210-3", name: "reuben-sandwich.jpeg", lastModified: 1690220594312, webkitRelativePath: "", size: 143584, type: "image/jpeg" },
    "createdAt": "2023-08-08T08:00:00",
    "updatedAt": "2023-08-08T08:00:00"
}
```

### Create Recipe Response

```js
201 Created
```

```json
{
    "name": "Reuben Sandwich",
    "description": "A delicious sandwich to bring to the beach",
    "ingredients": [
        {
            "name": "slices of rye",
            "unit":"N/A",
            "amount":8  
        },
        {
            "name": "Thousand Island dressing",
            "unit":"cup",
            "amount":.5  
        },
        {
            "name": "slices Swiss cheese",
            "unit":"N/A",
            "amount":8  
        },
        {
            "name": "slices deli sliced corned beef",
            "unit":"N/A",
            "amount":8  
        },
        {
            "name": "sauerkraut, drained",
            "unit":"cup",
            "amount":1  
        },
        {
            "name": "butter, softened",
            "unit":"tablespoons",
            "amount":2  
        }
    ],
    "instructions": {
        "1":"Preheat a large griddle or skillet over medium heat.",
        "2":"Spread one side of bread slices evenly with Thousand Island dressing. On four bread slices, layer one slice Swiss cheese, 2 slices corned beef, 1/4 cup sauerkraut, and a second slice of Swiss cheese. Top with remaining bread slices, dressing-side down. Butter the top of each sandwich.",
        "3":"Place sandwiches, butter-side down on the preheated griddle; butter the top of each sandwich with remaining butter. Grill until both sides are golden brown, about 5 minutes per side. Serve hot.",
    },
    "prepTime": 10,
    "cookTime": 10,
    "totalTime": 20,
    "servings": 4,
    "owner": "00000-000-00000-000000",
    "tags": ["savory","lunch","sandwich"],
    "image": ArrayBuffer() {},
    "createdAt": "2023-08-08T08:00:00",
    "updatedAt": "2023-08-08T08:00:00"
}
```

## Get Recipe

### Get Recipe Request

```js
GET /recipes/{{id}}
```

### Get Recipe Response

```js
200 Ok
```

```json
{
    "_id": "000-0000-0000-00000",
    "name": "Reuben Sandwich",
    "description": "A delicious sandwich to bring to the beach",
    "ingredients": [
        {
            "name": "slices of rye",
            "unit":"N/A",
            "amount":8  
        },
        {
            "name": "Thousand Island dressing",
            "unit":"cup",
            "amount":.5  
        },
        {
            "name": "slices Swiss cheese",
            "unit":"N/A",
            "amount":8  
        },
        {
            "name": "slices deli sliced corned beef",
            "unit":"N/A",
            "amount":8  
        },
        {
            "name": "sauerkraut, drained",
            "unit":"cup",
            "amount":1  
        },
        {
            "name": "butter, softened",
            "unit":"tablespoons",
            "amount":2  
        }
    ],
    "instructions": {
        "1":"Preheat a large griddle or skillet over medium heat.",
        "2":"Spread one side of bread slices evenly with Thousand Island dressing. On four bread slices, layer one slice Swiss cheese, 2 slices corned beef, 1/4 cup sauerkraut, and a second slice of Swiss cheese. Top with remaining bread slices, dressing-side down. Butter the top of each sandwich.",
        "3":"Place sandwiches, butter-side down on the preheated griddle; butter the top of each sandwich with remaining butter. Grill until both sides are golden brown, about 5 minutes per side. Serve hot.",
    },
    "prepTime": 10,
    "cookTime": 10,
    "totalTime": 20,
    "servings": 4,
    "owner": "00000xx000xx00000xx000000",
    "tags": ["savory","lunch","sandwich"],
    "image": ArrayBuffer() {},
    "createdAt": "2023-08-08T08:00:00",
    "updatedAt": "2023-08-08T08:00:00"
}
```

## Update Recipe

### Update Recipe Request

```js
PUT /recipes/{{id}}
```

```json

```

### Update Recipe Response

```js
204 No Content
```

or

```js
201 Created
```

```yml
Location: {{host}}/recipes/{{id}}
```

## Delete Recipe

### Delete Recipe Request

```js
DELETE /recipes/{{id}}
```

### Delete Recipe Response

```js
204 No Content
```
