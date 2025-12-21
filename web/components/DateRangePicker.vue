<template>
  <div class="relative">
    <label v-if="label" class="block text-sm font-semibold text-gray-300 mb-2">{{ label }}</label>
    <div id="date-range-picker" class="flex items-center">
      <!-- Start Date Input -->
      <div class="relative flex-1">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg class="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"/>
          </svg>
        </div>
        <input
          ref="startInput"
          :value="formattedStartDate"
          type="text"
          class="block w-full ps-9 pe-3 py-2.5 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-2 focus:ring-accent-purple focus:border-accent-purple shadow-sm cursor-pointer placeholder-gray-400"
          placeholder="gg.aa.yyyy"
          readonly
          @click="handleStartInputClick"
          @focus="handleStartInputClick"
        />
        <div
          v-if="showStartCalendar"
          v-click-outside="closeStartCalendar"
          class="absolute z-50 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4"
          style="min-width: 300px;"
        >
          <div class="flex items-center justify-between mb-4">
            <button
              @click="previousMonth('start')"
              class="p-1 hover:bg-gray-700 rounded transition-soft"
              type="button"
            >
              <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="flex items-center gap-2">
              <select
                v-model="startMonth"
                @change="updateStartDate"
                class="text-sm font-semibold text-white bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent-purple cursor-pointer"
              >
                <option v-for="(month, index) in months" :key="index" :value="index">{{ month }}</option>
              </select>
              <select
                v-model="startYear"
                @change="updateStartDate"
                class="text-sm font-semibold text-white bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent-purple cursor-pointer"
              >
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
            <button
              @click="nextMonth('start')"
              class="p-1 hover:bg-gray-700 rounded transition-soft"
              type="button"
            >
              <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="day in weekDays" :key="day" class="text-center text-xs font-semibold text-gray-400 py-2">
              {{ day }}
            </div>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <div
              v-for="day in startCalendarDays"
              :key="`start-${day.date}`"
              @click="!day.isDisabled && selectStartDate(day.date)"
              :class="[
                'text-center py-2 text-sm rounded transition-soft',
                day.isDisabled
                  ? 'text-gray-600 cursor-not-allowed opacity-50'
                  : 'cursor-pointer',
                day.isCurrentMonth && !day.isDisabled
                  ? day.isSelected
                    ? 'bg-accent-purple text-white font-semibold'
                    : day.isToday
                    ? 'bg-purple-900 bg-opacity-30 text-purple-300 font-semibold'
                    : 'text-white hover:bg-gray-700'
                  : day.isCurrentMonth && day.isDisabled
                  ? 'text-gray-600'
                  : 'text-gray-500',
              ]"
            >
              {{ day.day }}
            </div>
          </div>
          <div class="flex justify-between mt-4 pt-4 border-t border-gray-700">
            <button
              @click="clearStartDate"
              class="px-4 py-2 text-sm text-gray-400 hover:text-white transition-soft"
              type="button"
            >
              Temizle
            </button>
            <button
              @click="selectToday('start')"
              class="px-4 py-2 text-sm text-accent-purple hover:text-purple-300 transition-soft"
              type="button"
            >
              Bugün
            </button>
          </div>
        </div>
      </div>

      <span class="mx-4 text-gray-400">to</span>

      <!-- End Date Input -->
      <div class="relative flex-1">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg class="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"/>
          </svg>
        </div>
        <input
          ref="endInput"
          :value="formattedEndDate"
          type="text"
          class="block w-full ps-9 pe-3 py-2.5 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-2 focus:ring-accent-purple focus:border-accent-purple shadow-sm cursor-pointer placeholder-gray-400"
          placeholder="gg.aa.yyyy"
          readonly
          @click="handleEndInputClick"
          @focus="handleEndInputClick"
        />
        <div
          v-if="showEndCalendar"
          v-click-outside="closeEndCalendar"
          class="absolute z-50 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4"
          style="min-width: 300px;"
        >
          <div class="flex items-center justify-between mb-4">
            <button
              @click="previousMonth('end')"
              class="p-1 hover:bg-gray-700 rounded transition-soft"
              type="button"
            >
              <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="flex items-center gap-2">
              <select
                v-model="endMonth"
                @change="updateEndDate"
                class="text-sm font-semibold text-white bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent-purple cursor-pointer"
              >
                <option v-for="(month, index) in months" :key="index" :value="index">{{ month }}</option>
              </select>
              <select
                v-model="endYear"
                @change="updateEndDate"
                class="text-sm font-semibold text-white bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent-purple cursor-pointer"
              >
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
            <button
              @click="nextMonth('end')"
              class="p-1 hover:bg-gray-700 rounded transition-soft"
              type="button"
            >
              <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="day in weekDays" :key="day" class="text-center text-xs font-semibold text-gray-400 py-2">
              {{ day }}
            </div>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <div
              v-for="day in endCalendarDays"
              :key="`end-${day.date}`"
              @click="!day.isDisabled && selectEndDate(day.date)"
              :class="[
                'text-center py-2 text-sm rounded transition-soft',
                day.isDisabled
                  ? 'text-gray-600 cursor-not-allowed opacity-50'
                  : 'cursor-pointer',
                day.isCurrentMonth && !day.isDisabled
                  ? day.isSelected
                    ? 'bg-accent-purple text-white font-semibold'
                    : day.isToday
                    ? 'bg-purple-900 bg-opacity-30 text-purple-300 font-semibold'
                    : 'text-white hover:bg-gray-700'
                  : day.isCurrentMonth && day.isDisabled
                  ? 'text-gray-600'
                  : 'text-gray-500',
              ]"
            >
              {{ day.day }}
            </div>
          </div>
          <div class="flex justify-between mt-4 pt-4 border-t border-gray-700">
            <button
              @click="clearEndDate"
              class="px-4 py-2 text-sm text-gray-400 hover:text-white transition-soft"
              type="button"
            >
              Temizle
            </button>
            <button
              @click="selectToday('end')"
              class="px-4 py-2 text-sm text-accent-purple hover:text-purple-300 transition-soft"
              type="button"
            >
              Bugün
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "DateRangePicker",
  props: {
    label: {
      type: String,
      default: "",
    },
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
  },
  data() {
    const now = new Date();
    return {
      showStartCalendar: false,
      showEndCalendar: false,
      startMonth: now.getMonth(),
      startYear: now.getFullYear(),
      endMonth: now.getMonth(),
      endYear: now.getFullYear(),
      justOpened: false, // Flag to prevent immediate closing
      months: [
        "Ocak",
        "Şubat",
        "Mart",
        "Nisan",
        "Mayıs",
        "Haziran",
        "Temmuz",
        "Ağustos",
        "Eylül",
        "Ekim",
        "Kasım",
        "Aralık",
      ],
      weekDays: ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"],
    };
  },
  computed: {
    formattedStartDate(): string {
      if (!this.startDate) return "";
      const date = new Date(this.startDate);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    },
    formattedEndDate(): string {
      if (!this.endDate) return "";
      const date = new Date(this.endDate);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    },
    years(): number[] {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let i = currentYear - 10; i <= currentYear + 10; i++) {
        years.push(i);
      }
      return years;
    },
    startCalendarDays(): any[] {
      return this.getCalendarDays(this.startYear, this.startMonth, "start");
    },
    endCalendarDays(): any[] {
      return this.getCalendarDays(this.endYear, this.endMonth, "end");
    },
  },
  watch: {
    startDate(newVal: string) {
      if (newVal) {
        const date = new Date(newVal);
        this.startMonth = date.getMonth();
        this.startYear = date.getFullYear();
      }
    },
    endDate(newVal: string) {
      if (newVal) {
        const date = new Date(newVal);
        this.endMonth = date.getMonth();
        this.endYear = date.getFullYear();
      }
    },
  },
  methods: {
    getCalendarDays(year: number, month: number, type: "start" | "end"): any[] {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0

      const days: any[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get start date for validation (for end date picker)
      const startDateObj = this.startDate ? new Date(this.startDate) : null;
      if (startDateObj) {
        startDateObj.setHours(0, 0, 0, 0);
      }

      // Previous month days
      const prevMonth = new Date(year, month, 0);
      const prevMonthDays = prevMonth.getDate();
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthDays - i);
        date.setHours(0, 0, 0, 0);
        days.push({
          day: prevMonthDays - i,
          date: date.toISOString().split("T")[0],
          isCurrentMonth: false,
          isSelected: this.isDateSelected(date, type),
          isToday: this.isToday(date),
          isDisabled: this.isDateDisabled(date, type, today, startDateObj),
        });
      }

      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        date.setHours(0, 0, 0, 0);
        days.push({
          day: i,
          date: date.toISOString().split("T")[0],
          isCurrentMonth: true,
          isSelected: this.isDateSelected(date, type),
          isToday: this.isToday(date),
          isDisabled: this.isDateDisabled(date, type, today, startDateObj),
        });
      }

      // Next month days
      const remainingDays = 42 - days.length; // 6 rows * 7 days
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        date.setHours(0, 0, 0, 0);
        days.push({
          day: i,
          date: date.toISOString().split("T")[0],
          isCurrentMonth: false,
          isSelected: this.isDateSelected(date, type),
          isToday: this.isToday(date),
          isDisabled: this.isDateDisabled(date, type, today, startDateObj),
        });
      }

      return days;
    },
    isDateDisabled(date: Date, type: "start" | "end", today: Date, startDate: Date | null): boolean {
      const dateTime = date.getTime();
      const todayTime = today.getTime();

      if (type === "start") {
        // Start date cannot be after today
        return dateTime > todayTime;
      } else {
        // End date cannot be after today
        if (dateTime > todayTime) {
          return true;
        }
        // End date cannot be before start date (if start date is selected)
        if (startDate) {
          const startTime = startDate.getTime();
          return dateTime < startTime;
        }
        return false;
      }
    },
    isDateSelected(date: Date, type: "start" | "end"): boolean {
      const dateStr = date.toISOString().split("T")[0];
      if (type === "start") {
        return this.startDate === dateStr;
      } else {
        return this.endDate === dateStr;
      }
    },
    isToday(date: Date): boolean {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate.getTime() === today.getTime();
    },
    selectStartDate(dateStr: string) {
      const selectedDate = new Date(dateStr);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Validate: start date cannot be after today
      if (selectedDate.getTime() > today.getTime()) {
        return; // Don't select if invalid
      }

      this.$emit("update:startDate", dateStr);
      
      // If end date is before new start date, clear it
      if (this.endDate) {
        const endDateObj = new Date(this.endDate);
        endDateObj.setHours(0, 0, 0, 0);
        if (endDateObj.getTime() < selectedDate.getTime()) {
          this.$emit("update:endDate", "");
        }
      }
      
      this.showStartCalendar = false;
    },
    selectEndDate(dateStr: string) {
      const selectedDate = new Date(dateStr);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Validate: end date cannot be after today (always check this first)
      if (selectedDate.getTime() > today.getTime()) {
        return; // Don't select if invalid
      }
      
      // Validate: end date cannot be before start date (if start date is selected)
      if (this.startDate) {
        const startDateObj = new Date(this.startDate);
        startDateObj.setHours(0, 0, 0, 0);
        if (selectedDate.getTime() < startDateObj.getTime()) {
          return; // Don't select if invalid
        }
      }

      this.$emit("update:endDate", dateStr);
      this.showEndCalendar = false;
    },
    selectToday(type: "start" | "end") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateStr = today.toISOString().split("T")[0];
      
      if (type === "start") {
        this.$emit("update:startDate", dateStr);
        // If end date is before today, clear it
        if (this.endDate) {
          const endDateObj = new Date(this.endDate);
          endDateObj.setHours(0, 0, 0, 0);
          if (endDateObj.getTime() < today.getTime()) {
            this.$emit("update:endDate", "");
          }
        }
        this.showStartCalendar = false;
      } else {
        // For end date, check if start date exists and is valid
        if (this.startDate) {
          const startDateObj = new Date(this.startDate);
          startDateObj.setHours(0, 0, 0, 0);
          if (today.getTime() < startDateObj.getTime()) {
            // Can't select today if it's before start date
            return;
          }
        }
        this.$emit("update:endDate", dateStr);
        this.showEndCalendar = false;
      }
    },
    clearStartDate() {
      this.$emit("update:startDate", "");
      this.showStartCalendar = false;
    },
    clearEndDate() {
      this.$emit("update:endDate", "");
      this.showEndCalendar = false;
    },
    handleStartInputClick(event: Event) {
      event.stopPropagation();
      if (!this.showStartCalendar) {
        this.showStartCalendar = true;
        this.showEndCalendar = false;
        // Set flag to prevent immediate closing
        this.justOpened = true;
        this.$nextTick(() => {
          setTimeout(() => {
            this.justOpened = false;
          }, 300);
        });
      }
    },
    handleEndInputClick(event: Event) {
      event.stopPropagation();
      if (!this.showEndCalendar) {
        this.showEndCalendar = true;
        this.showStartCalendar = false;
        // Set flag to prevent immediate closing
        this.justOpened = true;
        this.$nextTick(() => {
          setTimeout(() => {
            this.justOpened = false;
          }, 300);
        });
      }
    },
    toggleStartCalendar() {
      this.showStartCalendar = !this.showStartCalendar;
      if (this.showStartCalendar) {
        this.showEndCalendar = false;
        // Set flag to prevent immediate closing
        this.justOpened = true;
        this.$nextTick(() => {
          setTimeout(() => {
            this.justOpened = false;
          }, 200);
        });
      }
    },
    toggleEndCalendar() {
      this.showEndCalendar = !this.showEndCalendar;
      if (this.showEndCalendar) {
        this.showStartCalendar = false;
        // Set flag to prevent immediate closing
        this.justOpened = true;
        this.$nextTick(() => {
          setTimeout(() => {
            this.justOpened = false;
          }, 200);
        });
      }
    },
    closeStartCalendar() {
      if (!this.justOpened) {
        this.showStartCalendar = false;
      }
    },
    closeEndCalendar() {
      if (!this.justOpened) {
        this.showEndCalendar = false;
      }
    },
    previousMonth(type: "start" | "end") {
      if (type === "start") {
        if (this.startMonth === 0) {
          this.startMonth = 11;
          this.startYear--;
        } else {
          this.startMonth--;
        }
      } else {
        if (this.endMonth === 0) {
          this.endMonth = 11;
          this.endYear--;
        } else {
          this.endMonth--;
        }
      }
    },
    nextMonth(type: "start" | "end") {
      if (type === "start") {
        if (this.startMonth === 11) {
          this.startMonth = 0;
          this.startYear++;
        } else {
          this.startMonth++;
        }
      } else {
        if (this.endMonth === 11) {
          this.endMonth = 0;
          this.endYear++;
        } else {
          this.endMonth++;
        }
      }
    },
    updateStartDate() {
      // Calendar will update automatically via computed property
    },
    updateEndDate() {
      // Calendar will update automatically via computed property
    },
  },
  directives: {
    "click-outside": {
      bind(el: any, binding: any, vnode: any) {
        el.clickOutsideEvent = (event: Event) => {
          const target = event.target as HTMLElement;
          // Get the input elements
          const startInput = vnode.context.$refs.startInput;
          const endInput = vnode.context.$refs.endInput;
          
          // Check if click is on input or its parent container
          const isStartInputClick = startInput && (startInput === target || startInput.contains(target));
          const isEndInputClick = endInput && (endInput === target || endInput.contains(target));
          const isInputClick = isStartInputClick || isEndInputClick;
          
          // Don't close if clicking on the calendar itself or the input
          if (!isInputClick && !(el === target || el.contains(target))) {
            // Use setTimeout to ensure this runs after the input click handler
            setTimeout(() => {
              vnode.context[binding.expression](event);
            }, 0);
          }
        };
        // Use mousedown instead of click to avoid conflicts
        document.addEventListener("mousedown", el.clickOutsideEvent);
      },
      unbind(el: any) {
        if (el.clickOutsideEvent) {
          document.removeEventListener("mousedown", el.clickOutsideEvent);
        }
      },
    },
  },
});
</script>

