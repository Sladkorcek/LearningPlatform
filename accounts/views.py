from django.shortcuts import render, reverse, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login

def register(request):

    form = UserCreationForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(reverse('landing_page'))

    return render(request,'register.html', {
        'form': form
    })