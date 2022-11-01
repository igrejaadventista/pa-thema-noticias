class AdminMetabox {

    /**
     * Constructor
     * @NOTE: This class is based on Text of Taxonomy term, so, if you change the text, please update the constructor
     */
    constructor() {
        window.onload=()=> {
            this.metaBox            = document.querySelector('.postbox.acf-postbox');
            this.visibility         = {'hidden': 'none', 'visible':'block'};
            this.termLabel          = {'audio': 'Áudio', 'video': 'Vídeo'};
            this.ariaLabel          = '[aria-label="Formato do post"]';
            this.needsValidation    = false;

            this.init();
        }
    }

    /**
     * Initialize MetaBox
     */
    init() {
        this.firstIteration();
        this.beforeSubmit();
    }

    /**
     * Toggle MetaBox Visibility
     */
    toggleMetaBox(visibility = this.visibility.hidden) {
        // Does it need to be validated in the future?
        visibility[0] === 'hidden' ? this.needsValidation = false : this.needsValidation = true;

        // Set visiblity on Metabox DOM element
        this.metaBox.style.display = this.visibility[visibility];
    }

    /**
     * Check term value and set visibility only on first Iteration
     * This is wrapped in a setTimeout, so that will be executed delayed
     */
    firstIteration() {
        // Hidden default
        this.toggleMetaBox(['hidden']);

        setTimeout(() => {
            this.getTermElm().then(elm => {
                // If it's video and audio type, so, show it.
                if(elm.text === this.termLabel.audio ||  elm.text === this.termLabel.video) {
                    this.toggleMetaBox(['visible']);
                }

                // Trigger the watches
                this.watchChanges();
                this.watchUrlChange();
            })
        }, 1000);
    }

    /**
     * Get current value of taxonomy term "Formato do post"
     * Async function
     */
    async getTermElm() {
        while ( document.querySelector(this.ariaLabel) === null) {
            await new Promise(r => setTimeout(r, 100));
        }
        // When the DOM finishes loading then return this element
        return document.querySelector(this.ariaLabel).querySelector('select option:checked');
    }

    /**
     * Watch for changes on select option
     * This is the most important function to be called
     */
    watchChanges() {
        // Get Select DOM element
        let select = document.querySelector(this.ariaLabel)
            .querySelector('select');

        // Add a listener
        select.addEventListener('change', (e) => {
            let value = select[e.target.selectedIndex].text;
            this.clearFields();

            // When the new value is selected and that value is audio or video then...
            if(value === this.termLabel.video || value === this.termLabel.audio){
                this.toggleMetaBox(['visible']);
            } else {
                this.toggleMetaBox(['hidden']);
            }
        });
    }

    /**
     * Watch for changes URL
     */
    watchUrlChange() {
        // Add a listener
        this.metaBox
            .querySelector('.input-search')
            .addEventListener('change', (e) =>
            {
                // If the URL has been modified, validate it again
                if(this.isValidateFields())
                    this.needsValidation = false;
            });
    }

    /**
     * Clear all ACF embed fields
     */
    clearFields() {
        // Take all inputs and clean it
        let inputs = this.metaBox.querySelectorAll('input');
        inputs.forEach(function(item, index){
            item.value = '';
        });

        // Take the canvas and clean it
        let canvas = this.metaBox.querySelector('.canvas-media');
        canvas.innerHTML = '';

        // Some style fixes
        this.metaBox.querySelector('i.acf-icon').style.display = 'block';
        this.metaBox.querySelector('.canvas').style.minHeight = '250px';
    }

    /**
     * Validate MetaBox Fields
     */
    isValidateFields() {
        let url = this.metaBox.querySelector('.input-search').value;

        // If the URL exists, if it is not empty and is a valid URL, then...
        if(url && url !== '' && this.isValidURL(url))
            return true;

        return false;
    }

    /**
     * Validate URL
     */
    isValidURL(string) {
        // Regex to URL validation
        let test = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        return (test !== null)
    }

    /**
     * Show a message on wp-editor
     */
    showErrorMessage(){
        // A Error Message hook
        wp.data.dispatch( 'core/notices' )
            .createErrorNotice(
                'Link de Áudio ou Vídeo é campo Obrigatório para esse formato de post',
                { id: 'URL_NOTICE',isDismissible: true}
            );
    }

    /**
     * Dismiss all message on wp-editor
     */
    dissmissMessage(){
        // Dismiss the error message hook
        wp.data.dispatch( 'core/notices' ).removeNotice('URL_NOTICE');
    }

    /**
     * Lock post save
     */
    lockPostSaving(){
        // Lock save hook post
        wp.data.dispatch( 'core/editor' ).lockPostSaving( 'lock_url' );
    }

    /**
     * Unlock post save
     */
    unlockPostSaving(){
        // Unlock save hook post
        wp.data.dispatch( 'core/editor' ).unlockPostSaving( 'lock_url' );
    }

    /**
     * Stop submitting MetaBox when clicking on Publish or update button
     */
    beforeSubmit() {
        // Get submit button
        const btnSubmit = document.querySelector('button.editor-post-publish-button');

        // Add a Listener
        btnSubmit.addEventListener('click', (e) => {
            // Stop default functions
            e.preventDefault();

            // If you need validation and it is not validated, then...
            if(this.needsValidation && !this.isValidateFields()) {
                this.showErrorMessage();
                this.lockPostSaving();
            } else {
                // If it's validated or doesn't need validation then clean everything and let it go
                this.dissmissMessage();
                this.unlockPostSaving();
                return true;
            }
        });
    }
}

new AdminMetabox();
