<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Moov KPI Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-bell</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>mdi-account</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item to="/" exact>
          <v-list-item-icon>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item to="/daily">
          <v-list-item-icon>
            <v-icon>mdi-calendar-today</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Daily KPIs</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item to="/hourly">
          <v-list-item-icon>
            <v-icon>mdi-clock-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Hourly KPIs</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item to="/imt">
          <v-list-item-icon>
            <v-icon>mdi-cash-multiple</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>IMT Transactions</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item to="/revenue">
          <v-list-item-icon>
            <v-icon>mdi-chart-line</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Revenue</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item to="/users">
          <v-list-item-icon>
            <v-icon>mdi-account-group</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Active Users</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item to="/reports">
          <v-list-item-icon>
            <v-icon>mdi-file-chart</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Reports</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(false)
</script>

<style scoped>
.v-app-bar {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
}
</style>