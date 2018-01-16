class Search {
    static selector() {
        return '.js-search-toggle';
    }

    constructor(node, searchForm) {
        this.node = node;
        this.searchForm = searchForm;
        this.bindEventListeners();
    }

    bindEventListeners() {
        this.node.click(this.toggle.bind(this));
    }

    toggle() {
        // show the search
        this.searchForm[0].classList.toggle('is-visible');

        // swap the icons
        this.node[0].querySelector('.header__icon--open-search').classList.toggle('is-hidden');
        this.node[0].querySelector('.header__icon--close-search').classList.toggle('is-unhidden');
    }
}

export default Search;
