---
title: How to Remove All Saved Posts from Facebook Using JavaScript
published: 2024-10-30
tags: [JavaScript, Script]
image: 'banner.jpeg'
category: JavaScript
draft: false
---

If you're an avid Facebook user, you've probably saved countless posts, videos, and links to revisit later.

But sometimes, these saved posts accumulate and become overwhelming. You may decide to un-save them all at once rather than manually unchecking each one, especially if you've amassed a large collection.

> [!WARNING]
> Before proceeding, note that this method will un-save all the displayed items on the page permanently. Once unsaved, the items will no longer appear in your saved list. There’s no way to retrieve them unless you manually save each post again. Please use this method with caution.

Also, You might need to use `allow pasting` and hit the Enter key if Facebook warns you before applying any JavaScript commands in the console.

## Step 1: Scroll Through Your Saved Items

Start by heading over to your Facebook saved items section. You can access this by clicking the menu icon (three horizontal lines) on the mobile app or the saved section on the left-hand side of the homepage on the desktop version.

Scroll down to load and display all the saved items that you want to un-save. Facebook only loads a few items at a time as you scroll, so ensure you've loaded everything you wish to unsave.

## Step 2: Open the Developer Console

To start the bulk un-saving process, you’ll need to use your browser’s developer console. Here’s how to do that:

* On Google Chrome: Press `Ctrl` + `Shift` + `J` (Windows) or `Cmd` + `Option` + `J` (Mac) to open the console.
* On Firefox: Press `Ctrl` + `Shift` + `K` (Windows) or `Cmd` + `Option` + `K` (Mac).

Once the console is open, you can start running the necessary JavaScript commands.

## Step 3: Open the Context Menu for Each Item

You’ll first need to open the contextual menu (the three dots beside each saved post) for every item on the page. This is where Facebook allows you to un-save individual posts.

Copy and paste the following command into the console and press **Enter**:

```javascript
Array.from(document.querySelector('[role=main]').querySelectorAll('[aria-label="More"]')).slice(1).map(e => e.click())
```

This command finds all the “More” buttons on the page and opens the contextual menu for each saved item.

## Step 4: Un-save Each Item

Once the contextual menus have been opened for each saved post, it’s time to bulk un-save them. For that, run the following command in the console:

```javascript
Array.from(document.querySelectorAll('[role=menuitem]')).map(e => e.click())
```

This command clicks on the "Un-save" option in every contextual menu that has been opened, removing the items from your saved list.

> [!IMPORTANT]  
> All the items that are displayed on the page will be unsaved permanently. Ensure that you’ve reviewed the items before proceeding with this method.

## Conclusion

This method saves you the hassle of manually un-saving items one by one. Just remember to scroll through and load all the saved items before running the script to ensure nothing is left behind.

Also, since this method affects only the currently displayed items, you may need to scroll and repeat the process if you have a lot of saved posts.

By following these steps, you can easily declutter your Facebook saved items and keep only what truly matters.

You can follow me on [GitHub](https://github.com/FahimFBA), [LinkedIn](https://www.linkedin.com/in/fahimfba/), and [YouTube](https://youtube.com/@FahimAmin) to get more content like this. Also, my [website](https://www.fahimbinamin.com/) is always available for you!

Resource: [GitHub Comment](https://github.com/bouiboui/facebook-saved/issues/6#issuecomment-755982611)