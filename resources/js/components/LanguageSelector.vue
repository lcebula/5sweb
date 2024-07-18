<template>
    <div class="language-selection">
        <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                <span :class="currentLanguage.icon" style="margin-right: 5px;"></span>{{ currentLanguage.name }}
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <li v-for="language in languages" :key="language.code">
                    <a class="dropdown-item" href="#" @click.prevent="setLanguage(language.code)">
                        <span :class="language.icon" style="margin-right: 5px;"></span>{{ language.name }}
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            languages: [
                { code: 'en', name: 'English', icon: 'flag-icon flag-icon-us' },
                { code: 'pt', name: 'Português', icon: 'flag-icon flag-icon-br' },
                { code: 'es', name: 'Español', icon: 'flag-icon flag-icon-es' }
            ],
            currentLanguage: { code: 'en', name: 'English', icon: 'flag-icon flag-icon-us' }
        }
    },
    methods: {
        setLanguage(languageCode) {
            const language = this.languages.find(lang => lang.code === languageCode);
            this.currentLanguage = language;
            this.$i18n.locale = languageCode;
            localStorage.setItem('language', languageCode);
        },
        detectLocationAndSetLanguage() {
            const storedLanguage = localStorage.getItem('language');
            if (storedLanguage) {
                this.setLanguage(storedLanguage);
            } else {
                axios.get('https://ipapi.co/json/').then(response => {
                    const countryCode = response.data.country_code;
                    let languageCode = 'en';
                    if (countryCode === 'BR') {
                        languageCode = 'pt';
                    } else if (countryCode === 'ES') {
                        languageCode = 'es';
                    }
                    this.setLanguage(languageCode);
                }).catch(() => {
                    this.setLanguage('en');
                });
            }
        }
    },
    created() {
        this.detectLocationAndSetLanguage();
    }
}
</script>

<style scoped>
.language-selection {
    margin-top: 1rem;
    text-align: center;
}
.dropdown-menu {
    min-width: 8rem;
}
.flag-icon {
    margin-right: 5px;
}
</style>
