const API_BASE_URL = 'http://amirtahanemati.ir/api';

// DOM Elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const modals = document.querySelectorAll('.modal');
const alertBoxes = document.querySelectorAll('.alert');

// Current state
let currentTab = 'students';
let currentPage = { students: 1, lecturers: 1, courses: 1 };
let currentSearch = { students: '', lecturers: '', courses: '' };
let itemToDelete = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    loadLecturers();
    loadCourses();
    setupTabs();
    setupModals();
    setupForms();
    setupSearch();
});

// Tabs
function setupTabs() {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    currentTab = tabId;
    tabs.forEach(tab => tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId));
    tabContents.forEach(content => content.classList.toggle('active', content.id === `${tabId}-tab`));
}

// Modals
function setupModals() {
    document.getElementById('add-student-btn').addEventListener('click', () => openStudentModal());
    document.getElementById('cancel-student-btn').addEventListener('click', () => closeModal('student-modal'));
    document.getElementById('add-lecturer-btn').addEventListener('click', () => openLecturerModal());
    document.getElementById('cancel-lecturer-btn').addEventListener('click', () => closeModal('lecturer-modal'));
    document.getElementById('add-course-btn').addEventListener('click', () => openCourseModal());
    document.getElementById('cancel-course-btn').addEventListener('click', () => closeModal('course-modal'));
    document.getElementById('cancel-delete-btn').addEventListener('click', () => {
        closeModal('confirm-modal');
        itemToDelete = null;
    });
    document.getElementById('confirm-delete-btn').addEventListener('click', () => {
        if (itemToDelete) {
            deleteItem(itemToDelete.type, itemToDelete.id);
            itemToDelete = null;
        }
        closeModal('confirm-modal');
    });
}

function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    clearErrors(modalId.replace('-modal', '-form'));
}

function openStudentModal(student = null) {
    const form = document.getElementById('student-form');
    const modalTitle = document.getElementById('student-modal-title');
    form.reset();
    clearErrors('student-form');
    if (student) {
        modalTitle.textContent = 'ویرایش دانشجو';
        populateStudentForm(student);
        form.dataset.mode = 'edit';
        form.dataset.id = student.STID;
    } else {
        modalTitle.textContent = 'افزودن دانشجوی جدید';
        form.dataset.mode = 'new';
        delete form.dataset.id;
    }
    openModal('student-modal');
}

function openLecturerModal(lecturer = null) {
    const form = document.getElementById('lecturer-form');
    const modalTitle = document.getElementById('lecturer-modal-title');
    form.reset();
    clearErrors('lecturer-form');
    if (lecturer) {
        modalTitle.textContent = 'ویرایش استاد';
        populateLecturerForm(lecturer);
        form.dataset.mode = 'edit';
        form.dataset.id = lecturer.LID;
    } else {
        modalTitle.textContent = 'افزودن استاد جدید';
        form.dataset.mode = 'new';
        delete form.dataset.id;
    }
    openModal('lecturer-modal');
}

function openCourseModal(course = null) {
    const form = document.getElementById('course-form');
    const modalTitle = document.getElementById('course-modal-title');
    form.reset();
    clearErrors('course-form');
    if (course) {
        modalTitle.textContent = 'ویرایش درس';
        populateCourseForm(course);
        form.dataset.mode = 'edit';
        form.dataset.id = course.CID;
    } else {
        modalTitle.textContent = 'افزودن درس جدید';
        form.dataset.mode = 'new';
        delete form.dataset.id;
    }
    openModal('course-modal');
}

function populateStudentForm(student) {
    document.getElementById('student-stid').value = student.STID || '';
    document.getElementById('student-fname').value = student.FName || '';
    document.getElementById('student-lname').value = student.LName || '';
    document.getElementById('student-father').value = student.Father || '';
    document.getElementById('student-birth').value = student.Birth || '';
    document.getElementById('student-ids').value = student.IDS || '';
    document.getElementById('student-borncity').value = student.BornCity || '';
    document.getElementById('student-address').value = student.Address || '';
    document.getElementById('student-postalcode').value = student.PostalCode || '';
    document.getElementById('student-cphone').value = student.Cphone || '';
    document.getElementById('student-hphone').value = student.Hphone || '';
    document.getElementById('student-department').value = student.Department || '';
    document.getElementById('student-major').value = student.Major || '';
    document.getElementById('student-married').value = student.Married || '';
    document.getElementById('student-id').value = student.ID || '';
}

function populateLecturerForm(lecturer) {
    document.getElementById('lecturer-lid').value = lecturer.LID || '';
    document.getElementById('lecturer-fname').value = lecturer.FName || '';
    document.getElementById('lecturer-lname').value = lecturer.LName || '';
    document.getElementById('lecturer-id').value = lecturer.ID || '';
    document.getElementById('lecturer-department').value = lecturer.Department || '';
    document.getElementById('lecturer-major').value = lecturer.Major || '';
    document.getElementById('lecturer-birth').value = lecturer.Birth || '';
    document.getElementById('lecturer-borncity').value = lecturer.BornCity || '';
    document.getElementById('lecturer-address').value = lecturer.Address || '';
    document.getElementById('lecturer-postalcode').value = lecturer.PostalCode || '';
    document.getElementById('lecturer-cphone').value = lecturer.Cphone || '';
    document.getElementById('lecturer-hphone').value = lecturer.Hphone || '';
}

function populateCourseForm(course) {
    document.getElementById('course-cid').value = course.CID || '';
    document.getElementById('course-cname').value = course.Cname || '';
    document.getElementById('course-department').value = course.Department || '';
    document.getElementById('course-credit').value = course.Credit || '';
}

// Validation
function validateStudentForm() {
    let isValid = true;
    clearErrors('student-form');

    const stid = document.getElementById('student-stid').value;
    if (!stid.match(/^(4\d{2}|0\d{2})114150\d{2}$/)) {
        showError('student-stid-error', 'شماره دانشجویی باید با فرمت صحیح (مثل 40111415001) باشد');
        isValid = false;
    }

    const fname = document.getElementById('student-fname').value;
    if (!fname.match(/^[\u0600-\u06FF\s]+$/)) {
        showError('student-fname-error', 'نام باید فقط حروف فارسی باشد');
        isValid = false;
    }

    const lname = document.getElementById('student-lname').value;
    if (!lname.match(/^[\u0600-\u06FF\s]+$/)) {
        showError('student-lname-error', 'نام خانوادگی باید فقط حروف فارسی باشد');
        isValid = false;
    }

    const id = document.getElementById('student-id').value;
    if (!id.match(/^\d{10}$/)) {
        showError('student-id-error', 'کد ملی باید 10 رقم باشد');
        isValid = false;
    }

    const birth = document.getElementById('student-birth').value;
    try {
        const [year, month, day] = birth.split('/').map(Number);
        if (!(1300 <= year && year <= 1400 && 1 <= month && month <= 12 && 1 <= day && day <= 31)) {
            showError('student-birth-error', 'تاریخ تولد باید بین ۱۳۰۰ تا ۱۴۰۰ باشد');
            isValid = false;
        }
    } catch {
        showError('student-birth-error', 'فرمت تاریخ باید yyyy/mm/dd باشد');
        isValid = false;
    }

    return isValid;
}

function validateLecturerForm() {
    let isValid = true;
    clearErrors('lecturer-form');

    const lid = document.getElementById('lecturer-lid').value;
    if (!lid.match(/^\d{6}$/)) {
        showError('lecturer-lid-error', 'کد استادی باید 6 رقم باشد');
        isValid = false;
    }

    const fname = document.getElementById('lecturer-fname').value;
    if (!fname.match(/^[\u0600-\u06FF\s]+$/)) {
        showError('lecturer-fname-error', 'نام باید فقط حروف فارسی باشد');
        isValid = false;
    }

    const lname = document.getElementById('lecturer-lname').value;
    if (!lname.match(/^[\u0600-\u06FF\s]+$/)) {
        showError('lecturer-lname-error', 'نام خانوادگی باید فقط حروف فارسی باشد');
        isValid = false;
    }

    const id = document.getElementById('lecturer-id').value;
    if (!id.match(/^\d{10}$/)) {
        showError('lecturer-id-error', 'کد ملی باید 10 رقم باشد');
        isValid = false;
    }

    return isValid;
}

function validateCourseForm() {
    let isValid = true;
    clearErrors('course-form');

    const cid = document.getElementById('course-cid').value;
    if (!cid.match(/^\d{5}$/)) {
        showError('course-cid-error', 'کد درس باید 5 رقم باشد');
        isValid = false;
    }

    const cname = document.getElementById('course-cname').value;
    if (!cname.match(/^[\u0600-\u06FF\s]{1,25}$/)) {
        showError('course-cname-error', 'نام درس باید بین 1 تا 25 کاراکتر و فقط حروف فارسی باشد');
        isValid = false;
    }

    return isValid;
}

// Forms
function setupForms() {
    document.getElementById('student-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateStudentForm()) return;
        await handleStudentSubmit();
    });

    document.getElementById('lecturer-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateLecturerForm()) return;
        await handleLecturerSubmit();
    });

    document.getElementById('course-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateCourseForm()) return;
        await handleCourseSubmit();
    });
}

async function handleStudentSubmit() {
    const form = document.getElementById('student-form');
    const isEdit = form.dataset.mode === 'edit';
    const studentId = form.dataset.id;

    const studentData = {
        STID: document.getElementById('student-stid').value,
        FName: document.getElementById('student-fname').value,
        LName: document.getElementById('student-lname').value,
        Father: document.getElementById('student-father').value,
        Birth: document.getElementById('student-birth').value,
        IDS: document.getElementById('student-ids').value,
        BornCity: document.getElementById('student-borncity').value,
        Address: document.getElementById('student-address').value || null,
        PostalCode: document.getElementById('student-postalcode').value || null,
        Cphone: document.getElementById('student-cphone').value || null,
        Hphone: document.getElementById('student-hphone').value || null,
        Department: document.getElementById('student-department').value,
        Major: document.getElementById('student-major').value,
        Married: document.getElementById('student-married').value,
        ID: document.getElementById('student-id').value
    };

    try {
        clearErrors('student-form');
        let response;
        if (isEdit) {
            response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/students/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            handleApiError('student', errorData);
            return;
        }

        showAlert('student-alert', `دانشجو با موفقیت ${isEdit ? 'ویرایش' : 'ثبت'} شد`, 'success');
        closeModal('student-modal');
        loadStudents();
    } catch (error) {
        showAlert('student-alert', 'خطا در ارتباط با سرور', 'error');
        console.error('Error:', error);
    }
}

async function handleLecturerSubmit() {
    const form = document.getElementById('lecturer-form');
    const isEdit = form.dataset.mode === 'edit';
    const lecturerId = form.dataset.id;

    const lecturerData = {
        LID: document.getElementById('lecturer-lid').value,
        FName: document.getElementById('lecturer-fname').value,
        LName: document.getElementById('lecturer-lname').value,
        ID: document.getElementById('lecturer-id').value,
        Department: document.getElementById('lecturer-department').value,
        Major: document.getElementById('lecturer-major').value,
        Birth: document.getElementById('lecturer-birth').value,
        BornCity: document.getElementById('lecturer-borncity').value,
        Address: document.getElementById('lecturer-address').value || null,
        PostalCode: document.getElementById('lecturer-postalcode').value || null,
        Cphone: document.getElementById('lecturer-cphone').value || null,
        Hphone: document.getElementById('lecturer-hphone').value || null
    };

    try {
        clearErrors('lecturer-form');
        let response;
        if (isEdit) {
            response = await fetch(`${API_BASE_URL}/lecturers/${lecturerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lecturerData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/lecturers/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lecturerData)
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            handleApiError('lecturer', errorData);
            return;
        }

        showAlert('lecturer-alert', `استاد با موفقیت ${isEdit ? 'ویرایش' : 'ثبت'} شد`, 'success');
        closeModal('lecturer-modal');
        loadLecturers();
    } catch (error) {
        showAlert('lecturer-alert', 'خطا در ارتباط با سرور', 'error');
        console.error('Error:', error);
    }
}

async function handleCourseSubmit() {
    const form = document.getElementById('course-form');
    const isEdit = form.dataset.mode === 'edit';
    const courseId = form.dataset.id;

    const courseData = {
        CID: document.getElementById('course-cid').value,
        Cname: document.getElementById('course-cname').value,
        Department: document.getElementById('course-department').value,
        Credit: document.getElementById('course-credit').value
    };

    try {
        clearErrors('course-form');
        let response;
        if (isEdit) {
            response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(courseData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/courses/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(courseData)
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            handleApiError('course', errorData);
            return;
        }

        showAlert('course-alert', `درس با موفقیت ${isEdit ? 'ویرایش' : 'ثبت'} شد`, 'success');
        closeModal('course-modal');
        loadCourses();
    } catch (error) {
        showAlert('course-alert', 'خطا در ارتباط با سرور', 'error');
        console.error('Error:', error);
    }
}

// Search
function setupSearch() {
    document.getElementById('search-student-btn').addEventListener('click', () => {
        currentSearch.students = document.getElementById('student-search').value;
        currentPage.students = 1;
        loadStudents();
    });

    document.getElementById('reset-student-search').addEventListener('click', () => {
        document.getElementById('student-search').value = '';
        currentSearch.students = '';
        currentPage.students = 1;
        loadStudents();
    });

    document.getElementById('search-lecturer-btn').addEventListener('click', () => {
        currentSearch.lecturers = document.getElementById('lecturer-search').value;
        currentPage.lecturers = 1;
        loadLecturers();
    });

    document.getElementById('reset-lecturer-search').addEventListener('click', () => {
        document.getElementById('lecturer-search').value = '';
        currentSearch.lecturers = '';
        currentPage.lecturers = 1;
        loadLecturers();
    });

    document.getElementById('search-course-btn').addEventListener('click', () => {
        currentSearch.courses = document.getElementById('course-search').value;
        currentPage.courses = 1;
        loadCourses();
    });

    document.getElementById('reset-course-search').addEventListener('click', () => {
        document.getElementById('course-search').value = '';
        currentSearch.courses = '';
        currentPage.courses = 1;
        loadCourses();
    });
}

// Data Loading
async function loadStudents() {
    try {
        let url = `${API_BASE_URL}/students/?offset=${(currentPage.students - 1) * 10}&limit=10`;
        if (currentSearch.students) url += `&search=${encodeURIComponent(currentSearch.students)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات دانشجویان');
        const data = await response.json();
        renderStudents(data.students);
        renderPagination('student-pagination', currentPage.students, Math.ceil(data.total / 10), 'students');
    } catch (error) {
        showAlert('student-alert', error.message, 'error');
        console.error('Error:', error);
    }
}

async function loadLecturers() {
    try {
        let url = `${API_BASE_URL}/lecturers/?offset=${(currentPage.lecturers - 1) * 10}&limit=10`;
        if (currentSearch.lecturers) url += `&search=${encodeURIComponent(currentSearch.lecturers)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات اساتید');
        const data = await response.json();
        renderLecturers(data.lecturers);
        renderPagination('lecturer-pagination', currentPage.lecturers, Math.ceil(data.total / 10), 'lecturers');
    } catch (error) {
        showAlert('lecturer-alert', error.message, 'error');
        console.error('Error:', error);
    }
}

async function loadCourses() {
    try {
        let url = `${API_BASE_URL}/courses/?offset=${(currentPage.courses - 1) * 10}&limit=10`;
        if (currentSearch.courses) url += `&search=${encodeURIComponent(currentSearch.courses)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات دروس');
        const data = await response.json();
        renderCourses(data.courses);
        renderPagination('course-pagination', currentPage.courses, Math.ceil(data.total / 10), 'courses');
    } catch (error) {
        showAlert('course-alert', error.message, 'error');
        console.error('Error:', error);
    }
}

// Rendering
function renderStudents(students) {
    const tbody = document.getElementById('students-list');
    tbody.innerHTML = '';
    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.STID}</td>
            <td>${student.FName}</td>
            <td>${student.LName}</td>
            <td>${student.ID}</td>
            <td>${student.Major}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" data-id="${student.STID}">
                        <i class="fas fa-edit"></i> ویرایش
                    </button>
                    <button class="action-btn delete-btn" data-id="${student.STID}">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const studentId = e.currentTarget.getAttribute('data-id');
            const student = await getStudent(studentId);
            if (student) openStudentModal(student);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const studentId = e.currentTarget.getAttribute('data-id');
            showDeleteConfirmation('students', studentId, `آیا از حذف دانشجو با شماره دانشجویی ${studentId} مطمئن هستید؟`);
        });
    });
}

function renderLecturers(lecturers) {
    const tbody = document.getElementById('lecturers-list');
    tbody.innerHTML = '';
    lecturers.forEach(lecturer => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${lecturer.LID}</td>
            <td>${lecturer.FName}</td>
            <td>${lecturer.LName}</td>
            <td>${lecturer.ID}</td>
            <td>${lecturer.Major}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" data-id="${lecturer.LID}">
                        <i class="fas fa-edit"></i> ویرایش
                    </button>
                    <button class="action-btn delete-btn" data-id="${lecturer.LID}">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const lecturerId = e.currentTarget.getAttribute('data-id');
            const lecturer = await getLecturer(lecturerId);
            if (lecturer) openLecturerModal(lecturer);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lecturerId = e.currentTarget.getAttribute('data-id');
            showDeleteConfirmation('lecturers', lecturerId, `آیا از حذف استاد با کد استادی ${lecturerId} مطمئن هستید؟`);
        });
    });
}

function renderCourses(courses) {
    const tbody = document.getElementById('courses-list');
    tbody.innerHTML = '';
    courses.forEach(course => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${course.CID}</td>
            <td>${course.Cname}</td>
            <td>${course.Department}</td>
            <td>${course.Credit}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" data-id="${course.CID}">
                        <i class="fas fa-edit"></i> ویرایش
                    </button>
                    <button class="action-btn delete-btn" data-id="${course.CID}">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const courseId = e.currentTarget.getAttribute('data-id');
            const course = await getCourse(courseId);
            if (course) openCourseModal(course);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const courseId = e.currentTarget.getAttribute('data-id');
            showDeleteConfirmation('courses', courseId, `آیا از حذف درس با کد ${courseId} مطمئن هستید؟`);
        });
    });
}

function renderPagination(elementId, currentPage, totalPages, type) {
    const pagination = document.getElementById(elementId);
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        prevBtn.addEventListener('click', () => {
            currentPage[type]--;
            if (type === 'students') loadStudents();
            else if (type === 'lecturers') loadLecturers();
            else if (type === 'courses') loadCourses();
        });
        pagination.appendChild(prevBtn);
    }

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage[type] = i;
            if (type === 'students') loadStudents();
            else if (type === 'lecturers') loadLecturers();
            else if (type === 'courses') loadCourses();
        });
        pagination.appendChild(pageBtn);
    }

    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        nextBtn.addEventListener('click', () => {
            currentPage[type]++;
            if (type === 'students') loadStudents();
            else if (type === 'lecturers') loadLecturers();
            else if (type === 'courses') loadCourses();
        });
        pagination.appendChild(nextBtn);
    }
}

// Helpers
async function getStudent(studentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`);
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات دانشجو');
        return await response.json();
    } catch (error) {
        showAlert('student-alert', error.message, 'error');
        console.error('Error:', error);
        return null;
    }
}

async function getLecturer(lecturerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/lecturers/${lecturerId}`);
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات استاد');
        return await response.json();
    } catch (error) {
        showAlert('lecturer-alert', error.message, 'error');
        console.error('Error:', error);
        return null;
    }
}

async function getCourse(courseId) {
    try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات درس');
        return await response.json();
    } catch (error) {
        showAlert('course-alert', error.message, 'error');
        console.error('Error:', error);
        return null;
    }
}

async function deleteItem(type, id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${type}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('خطا در حذف اطلاعات');
        showAlert(`${type}-alert`, `${type === 'students' ? 'دانشجو' : type === 'lecturers' ? 'استاد' : 'درس'} با موفقیت حذف شد`, 'success');
        if (type === 'students') loadStudents();
        else if (type === 'lecturers') loadLecturers();
        else if (type === 'courses') loadCourses();
    } catch (error) {
        showAlert(`${type}-alert`, error.message, 'error');
        console.error('Error:', error);
    }
}

function showDeleteConfirmation(type, id, message) {
    itemToDelete = { type, id };
    document.getElementById('confirm-title').textContent = `حذف ${type === 'students' ? 'دانشجو' : type === 'lecturers' ? 'استاد' : 'درس'}`;
    document.getElementById('confirm-message').textContent = message;
    openModal('confirm-modal');
}

function showAlert(elementId, message, type) {
    const alertBox = document.getElementById(elementId);
    alertBox.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    alertBox.className = `alert alert-${type}`;
    alertBox.classList.remove('hidden');
    setTimeout(() => alertBox.classList.add('hidden'), 5000);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function clearErrors(formId) {
    const form = document.getElementById(formId);
    form.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
    });
}

function handleApiError(prefix, errorData) {
    if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
            showAlert(`${prefix}-alert`, errorData.detail, 'error');
        } else {
            errorData.detail.forEach(error => {
                const field = error.loc[error.loc.length - 1].toLowerCase();
                const errorElement = document.getElementById(`${prefix}-${field}-error`);
                if (errorElement) {
                    showError(`${prefix}-${field}-error`, error.msg);
                } else {
                    showAlert(`${prefix}-alert`, error.msg, 'error');
                }
            });
        }
    } else {
        showAlert(`${prefix}-alert`, 'خطای ناشناخته در سرور', 'error');
    }
}